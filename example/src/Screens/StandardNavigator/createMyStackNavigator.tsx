import {
  createStandardNavigationFactories,
  type NavigationProp,
  type ParamListBase,
  type RouteProp,
  type StackActionHelpers,
  type StackNavigationState,
  StackRouter,
  type StackRouterOptions,
  type StandardNavigationTypeBagBase,
} from '@react-navigation/native';

import {
  type MyStackEventMap,
  MyStackNavigator,
  type MyStackNavigatorProps,
  type MyStackOptions,
} from './MyStackNavigator';

export interface MyStackTypeBag extends StandardNavigationTypeBagBase {
  State: StackNavigationState<this['ParamList']>;
  ActionHelpers: StackActionHelpers<this['ParamList']>;
  ScreenOptions: MyStackOptions;
  EventMap: MyStackEventMap;
  NavigatorProps: MyStackNavigatorProps;
  RouterOptions: StackRouterOptions;
}

export type MyStackNavigationProp<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = keyof ParamList,
  NavigatorID extends string | undefined = undefined,
> = NavigationProp<
  ParamList,
  RouteName,
  NavigatorID,
  StackNavigationState<ParamList>,
  MyStackOptions,
  MyStackEventMap
> &
  StackActionHelpers<ParamList>;

export type MyStackScreenProps<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = keyof ParamList,
  NavigatorID extends string | undefined = undefined,
> = {
  navigation: MyStackNavigationProp<ParamList, RouteName, NavigatorID>;
  route: RouteProp<ParamList, RouteName>;
};

export const {
  createNavigator: createMyStackNavigator,
  createScreen: createMyStackScreen,
} = createStandardNavigationFactories<MyStackTypeBag>(
  MyStackNavigator,
  StackRouter,
  ({ state }) => ({
    preloadedCount:
      'preloadedRoutes' in state && Array.isArray(state.preloadedRoutes)
        ? state.preloadedRoutes.length
        : 0,
  })
);
