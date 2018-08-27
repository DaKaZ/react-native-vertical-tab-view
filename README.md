# react-native-vertical-tab-view

An extension to [react-native-tab-view](https://github.com/react-native-community/react-native-tab-view) which provides
a vertical tab bar (great for landscape and tablet layouts).  This work is largely derived from the excellent work that
[@satya164](https://github.com/satya164) has done on react-native-tab-view, including many of his suggestions for extracting
this into a stand alone library.

This library is API compatible with react-native-tab-view and can be used as a drop in replacement as it re-exports all
of the named exports from react-native-tab-view.

[[https://github.com/DaKaZ/react-native-vertical-tab-view/blob/master/example/assets/VerticalTabView.gif|alt=VerticalTabView]]


## Installation ##

```
yarn add react-native-vertical-tab-view
```

## Quick Start ##

See the docs at [react-native-tab-view](https://github.com/react-native-community/react-native-tab-view#quick-start)

A quick overview, first you need the TabView setup:

```javascript
  <TabViewVertical
    initialLayout={initialLayout}
    renderTabBar={this._renderTabs}
    style={styles.container}
    navigationState={this.state}
    renderScene={this._renderScene}
    onIndexChange={this._handleIndexChange}
  />
```

and then you need the TabBar:

```javascript
  _renderTabs = (landscape: boolean, otherProps: SceneRendererProps): Element<*> => {
    const SelectedTabBar = landscape ? TabBarVertical : TabBar;
    return (
      <SelectedTabBar
        {...otherProps}
        renderLabel={this._renderLabelFactory(otherProps)}
        renderIcon={this._renderIconFactory(otherProps)}
        style={styles.tabbar}
        tabStyle={styles.tab}
        indicatorStyle={styles.indicator}
        scrollEnabled
      />
    );
  };
```

### Tab Style ###

This is IMPORTANT: make sure you pass in HEIGHT with your tab style:

```javascript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDECED'
  },
  tabbar: {
    backgroundColor: '#205493'
  },
  tab: {
    width: 110,
    height: 80
  },
  icon: {
    backgroundColor: 'transparent'
    color: '#ffffff'
  },
  indicator: {
    width: 110,
    height: 80,
    backgroundColor: '#F6F7F8'
  },
  label: {
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Source Sans Pro',
    paddingTop: 5,
    color: '#F6F7F8',
    backgroundColor: 'transparent'
  }
});
```


## Using with Orientation ##

One of the best use cases for the vertical tabs is when the device is used in landscape mode, you shift
the tabs from the bottom to the left.  Check out [react-native-orientation](https://github.com/yamill/react-native-orientation)
for help getting the orientation setup, then look at an implementation like this:

```javascript
class TabsScreen extends PureComponent<PropsType, StateType> {
  static defaultProps = {
    screenProps: { orientation: 'PORTRAIT' }
  };

  constructor(props: PropsType) {
    super(props);
    this.state = {
      index: 0,
      routes: [
        { key: '1', title: 'DASHBOARD', icon: 'tachometer', path: 'dashboard' },
        { key: '2', title: 'EMERGENCY', icon: 'phone', path: 'emergency' },
        { key: '3', title: 'FINANCE', icon: 'pie-chart', path: 'finance' },
        { key: '4', title: 'PERFORMANCE', icon: 'line-chart', path: 'performance' },
        { key: '5', title: 'FACILITIES', icon: 'building', path: 'facilities' },
        { key: '6', title: 'HUMAN RESOURCES', icon: 'users', path: 'human_resources' }
      ]
    };
  }

  _handleIndexChange = (index: number) => {
    this.setState({ index });
  };

  _renderLabelFactory = (props: TabScreenSceneRenderPropsType): TabBarCallbackType => (
    ({ route }: TabScreenSceneType): Element<*> => {
      const index = props.navigationState.routes.indexOf(route);
      const inputRange =
        props.navigationState.routes.map((x: TabScreenRouteType, i: number): number => i);
      const outputRange = inputRange.map((inputIndex: number): string =>
        (inputIndex === index ? Colors.lightBlue : Colors.dhsWhite));
      const color = props.position.interpolate({
        inputRange,
        outputRange
      });
      return <Animated.Text style={[styles.label, { color }]}>{route.title}</Animated.Text>;
    }
  );

  _renderIconFactory = (props: TabScreenSceneRenderPropsType): TabBarCallbackType => (
    ({ route }: TabScreenSceneType): Element<*> => {
      const index = props.navigationState.routes.indexOf(route);
      const inputRange =
        props.navigationState.routes.map((x: TabScreenRouteType, i: number): number => i);
      const outputRange = inputRange.map((inputIndex: number): string =>
        (inputIndex === index ? Colors.lightBlue : Colors.dhsWhite));
      const color = props.position.interpolate({
        inputRange,
        outputRange
      });
      const AnimatedIcon = Animated.createAnimatedComponent(Icon);
      return <AnimatedIcon name={route.icon} size={30} style={[styles.icon, { color }]} />;
    }
  );

  _renderTabs = (landscape: boolean, otherProps: SceneRendererProps): Element<*> => {
    const SelectedTabBar = landscape ? TabBarVertical : TabBar;
    return (
      <SelectedTabBar
        {...otherProps}
        renderLabel={this._renderLabelFactory(otherProps)}
        renderIcon={this._renderIconFactory(otherProps)}
        style={styles.tabbar}
        tabStyle={styles.tab}
        indicatorStyle={styles.indicator}
        scrollEnabled
      />
    );
  };

  _renderScene = SceneMap({
    '1': Screen1,
    '2': Screen2,
    '3': Screen3,
    '4': Screen4,
    '5': Screen5,
    '6': Screen6
  });

  render(): Element<*> {
    // Orientation coming in from react-native-orientation
    const landscape = this.props.orientation.split('-')[0] === 'LANDSCAPE';
    const SelectedTabView = landscape ? TabViewVertical : TabView;
    const initialLayout = { width: 600, height: 400 };
    return (
      <SelectedTabView
        initialLayout={initialLayout}
        renderTabBar={(props: SceneRendererProps) => this._renderTabs(landscape, props)}
        style={styles.container}
        navigationState={this.state}
        renderScene={this._renderScene}
        onIndexChange={this._handleIndexChange}
        swipeEnabled
      />
    );
  }
}
```



