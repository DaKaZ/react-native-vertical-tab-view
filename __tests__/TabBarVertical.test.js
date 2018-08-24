/* @flow */

import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { shallow } from 'enzyme';
import TabViewVertical from '../src/TabViewVertical';
import TabBarVertical from '../src/TabBarVertical';
import { SceneMap } from '../src/index';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabbar: {
    backgroundColor: '#3f51b5',
  },
  tab: {
    width: 180,
    height: 80,
  },
  indicator: {
    backgroundColor: '#ffeb3b',
  },
  label: {
    color: '#fff',
    fontWeight: '400',
  },
});

const state = {
  index: 1,
  routes: [
    { key: 'article', title: 'Article' },
    { key: 'contacts', title: 'Contacts' },
    { key: 'albums', title: 'Albums' },
    { key: 'chat', title: 'Chat' },
  ],
};

const _handleIndexChange = jest.fn();

const _renderTabBar = props => (
  <TabBarVertical
    {...props}
    scrollEnabled
    indicatorStyle={styles.indicator}
    style={styles.tabbar}
    tabStyle={styles.tab}
    labelStyle={styles.label}
  />
);

const _renderScene = SceneMap({
  albums: View,
  contacts: View,
  article: View,
  chat: View,
});

it('renders a vertical tab bar', () => {
  const component = shallow(
    <TabViewVertical
      style={[styles.container]}
      navigationState={state}
      renderScene={_renderScene}
      renderTabBar={_renderTabBar}
      onIndexChange={_handleIndexChange}
      initialLayout={{ width: 800, height: 600 }}
    />
  );
  expect(component).toMatchSnapshot();
});
