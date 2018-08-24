/* @flow */

import * as React from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import TabBarVertical from './TabBarVertical';
import { PagerDefault } from 'react-native-tab-view';

import type {
  Scene,
  SceneRendererProps,
  NavigationState,
  Layout,
  PagerCommonProps,
  PagerExtraProps,
} from 'react-native-tab-view/src/TypeDefinitions';
import type { ViewStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';

type Props<T> = PagerCommonProps<T> &
  PagerExtraProps & {
    navigationState: NavigationState<T>,
    onIndexChange: (index: number) => mixed,
    initialLayout?: Layout,
    renderPager: (props: *) => React.Node,
    renderScene: (props: SceneRendererProps<T> & Scene<T>) => React.Node,
    renderTabBar: (props: SceneRendererProps<T>) => React.Node,
    tabBarPosition: 'top' | 'bottom',
    useNativeDriver?: boolean,
    style?: ViewStyleProp,
  };

type State = {|
  sceneLayout: Layout & { measured: boolean },
  windowLayout: Layout & { measured: boolean },
  layoutXY: Animated.ValueXY,
  panX: Animated.Value,
  offsetX: Animated.Value,
  position: any,
|};

export default class TabViewVertical<T: *> extends React.Component<
  Props<T>,
  State
> {
  static defaultProps = {
    canJumpToTab: () => true,
    tabBarPosition: 'top',
    renderTabBar: (props: *) => <TabBarVertical {...props} />,
    renderPager: (props: *) => <PagerDefault {...props} />,
    getTestID: ({ route }: Scene<*>) =>
      typeof route.testID === 'string' ? route.testID : undefined,
    initialLayout: {
      height: 0,
      width: 0,
    },
    useNativeDriver: false,
  };

  constructor(props: Props<T>) {
    super(props);

    const { navigationState } = this.props;
    const layout = {
      ...this.props.initialLayout,
      measured: false,
    };

    const panX = new Animated.Value(0);
    const offsetX = new Animated.Value(-navigationState.index * layout.width);
    const layoutXY = new Animated.ValueXY({
      // This is hacky, but we need to make sure that the value is never 0
      x: layout.width || 0.001,
      y: layout.height || 0.001,
    });
    const position = Animated.multiply(
      Animated.divide(Animated.add(panX, offsetX), layoutXY.x),
      -1
    );

    this.state = {
      sceneLayout: layout,
      windowLayout: layout,
      layoutXY,
      panX,
      offsetX,
      position,
    };
  }

  componentDidMount() {
    this._mounted = true;
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  _mounted: boolean = false;
  _nextIndex: ?number;

  _renderScene = (props: SceneRendererProps<T> & Scene<T>) => {
    return this.props.renderScene(props);
  };

  _handleLayoutScene = (e: any) => {
    const { height, width } = e.nativeEvent.layout;

    if (
      this.state.sceneLayout.width === width &&
      this.state.sceneLayout.height === height
    ) {
      return;
    }

    this.state.offsetX.setValue(-this.props.navigationState.index * width);
    this.state.layoutXY.setValue({
      // This is hacky, but we need to make sure that the value is never 0
      x: width || 0.001,
      y: height || 0.001,
    });

    this.setState({
      sceneLayout: {
        measured: true,
        height,
        width,
      },
    });
  };

  _handleLayoutWindow = (e: any) => {
    const { height, width } = e.nativeEvent.layout;

    if (
      this.state.windowLayout.width === width &&
      this.state.windowLayout.height === height
    ) {
      return;
    }

    this.setState({
      windowLayout: {
        measured: true,
        height,
        width,
      },
    });
  };

  _buildSceneRendererProps = (): SceneRendererProps<*> => ({
    panX: this.state.panX,
    offsetX: this.state.offsetX,
    position: this.state.position,
    layout: this.state.sceneLayout,
    navigationState: this.props.navigationState,
    jumpTo: this._jumpTo,
    useNativeDriver: this.props.useNativeDriver === true,
  });

  _jumpTo = (key: string) => {
    if (!this._mounted) {
      // We are no longer mounted, this is a no-op
      return;
    }

    const { canJumpToTab, navigationState } = this.props;
    const index = navigationState.routes.findIndex(route => route.key === key);

    if (!canJumpToTab(navigationState.routes[index])) {
      return;
    }

    if (index !== navigationState.index) {
      this.props.onIndexChange(index);
    }
  };

  render() {
    const {
      /* eslint-disable no-unused-vars */
      navigationState,
      onIndexChange,
      initialLayout,
      renderScene,
      /* eslint-enable no-unused-vars */
      renderPager,
      renderTabBar,
      tabBarPosition,
      ...rest
    } = this.props;

    const props = this._buildSceneRendererProps();

    return (
      <View
        collapsable={false}
        onLayout={this._handleLayoutWindow}
        style={[styles.container, this.props.style]}
      >
        {(tabBarPosition === 'top' || tabBarPosition === 'left') &&
          renderTabBar(props)}
        <View onLayout={this._handleLayoutScene} style={styles.pager}>
          {renderPager({
            ...props,
            ...rest,
            panX: this.state.panX,
            offsetX: this.state.offsetX,
            children: navigationState.routes.map(route => {
              const scene = this._renderScene({
                ...props,
                route,
              });

              if (React.isValidElement(scene)) {
                /* $FlowFixMe: https://github.com/facebook/flow/issues/4775 */
                return React.cloneElement(scene, { key: route.key });
              }

              return scene;
            }),
          })}
        </View>
        {(tabBarPosition === 'bottom' || tabBarPosition === 'right') &&
          renderTabBar(props)}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  pager: {
    flex: 1,
  },
});
