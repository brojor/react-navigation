import {
  CommonActions,
  createNavigatorFactory,
  type DefaultNavigatorOptions,
  type DefaultRouterOptions,
  type EventMapBase,
  type NavigationAction,
  type NavigationProp,
  type NavigatorTypeBagBase,
  type ParamListBase,
  type RouterFactory,
  type StaticConfig,
  type StaticParamList,
  type TypedNavigator,
  useNavigationBuilder,
} from '@react-navigation/core';
import * as React from 'react';
import type {
  createStandardNavigator,
  NavigatorArgs as StandardNavigationArgs,
} from 'standard-navigation';

import { useBuildHref } from './useLinkBuilder';
import { useMemoArray } from './useMemoArray';

type StandardEventMap<EventMap extends EventMapBase> = {
  [EventName in keyof EventMap]: {
    data: EventMap[EventName] extends { data?: infer Data }
      ? Data extends object | undefined
        ? Data
        : object | undefined
      : undefined;
    canPreventDefault: EventMap[EventName] extends { canPreventDefault: true }
      ? true
      : false;
  };
};

type ActionHelpersOf<T> =
  T extends Record<string, (...args: never[]) => unknown> ? T : {};

type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

type RequiredProps<T> = Pick<T, RequiredKeys<T>>;

type StandardNavigationNavigatorCustomProps<
  TypeBag extends StandardNavigationTypeBagBase,
  MappedProps extends object = {},
> = TypeBag['RouterOptions'] &
  Omit<
    TypeBag['NavigatorProps'],
    | keyof StandardNavigationArgs<
        TypeBag['ScreenOptions'],
        StandardEventMap<TypeBag['EventMap']>
      >
    | keyof MappedProps
  >;

type StandardNavigationNavigatorProps<
  TypeBag extends StandardNavigationTypeBagBase,
  MappedProps extends object = {},
> = StandardNavigationNavigatorCustomProps<TypeBag, MappedProps> &
  DefaultNavigatorOptions<
    ParamListBase,
    string | undefined,
    StandardNavigationTypeBagFor<TypeBag, ParamListBase>['State'],
    TypeBag['ScreenOptions'],
    TypeBag['EventMap'],
    StandardNavigation<TypeBag>
  >;

type StandardNavigationTypeBagFor<
  TypeBag extends StandardNavigationTypeBagBase,
  ParamList extends ParamListBase,
  NavigatorID extends string | undefined = string | undefined,
> = TypeBag & {
  ParamList: ParamList;
  NavigatorID: NavigatorID;
};

type StandardNavigation<TypeBag extends StandardNavigationTypeBagBase> =
  StandardNavigationTypeBagFor<
    TypeBag,
    ParamListBase
  >['NavigationList'][keyof StandardNavigationTypeBagFor<
    TypeBag,
    ParamListBase
  >['NavigationList']];

type StandardNavigationPropsMapper<
  TypeBag extends StandardNavigationTypeBagBase,
  MappedProps extends object,
> = (props: {
  state: StandardNavigationTypeBagFor<TypeBag, ParamListBase>['State'];
  navigation: StandardNavigation<TypeBag>;
}) => MappedProps;

type StandardNavigationScreenConfig<
  TypeBag extends StandardNavigationTypeBagBase,
> = {
  screen: React.ComponentType<any>;
  options?:
    | TypeBag['ScreenOptions']
    | ((props: {
        route: { params?: object | undefined };
        navigation: StandardNavigation<TypeBag>;
      }) => TypeBag['ScreenOptions']);
  linking?: unknown;
};

type StandardNavigationScreenConfigValidation<
  TypeBag extends StandardNavigationTypeBagBase,
  Config,
> = Config extends { options: infer Options }
  ? Options extends (...args: never[]) => infer Result
    ? Exclude<keyof Result, keyof TypeBag['ScreenOptions']> extends never
      ? unknown
      : never
    : Exclude<keyof Options, keyof TypeBag['ScreenOptions']> extends never
      ? unknown
      : never
  : unknown;

type StandardNavigationTypeBagWithNavigator<
  TypeBag extends StandardNavigationTypeBagBase,
  ParamList extends ParamListBase,
  NavigatorID extends string | undefined = string | undefined,
  MappedProps extends object = {},
> = Omit<
  StandardNavigationTypeBagFor<TypeBag, ParamList, NavigatorID>,
  'Navigator'
> & {
  Navigator: React.ComponentType<
    StandardNavigationNavigatorCustomProps<TypeBag, MappedProps>
  >;
};

type StandardNavigationFactories<
  TypeBag extends StandardNavigationTypeBagBase,
  MappedProps extends object,
> = {
  createNavigator: StandardNavigationCreateNavigator<TypeBag, MappedProps>;
  createScreen: <const Config>(
    config: Config &
      StandardNavigationScreenConfig<TypeBag> &
      StandardNavigationScreenConfigValidation<TypeBag, Config>
  ) => Config;
};

export type StandardNavigationCreateNavigator<
  TypeBag extends StandardNavigationTypeBagBase,
  MappedProps extends object,
> = {
  <
    const ParamList extends ParamListBase,
    const NavigatorID extends string | undefined = string | undefined,
  >(): TypedNavigator<
    StandardNavigationTypeBagWithNavigator<
      TypeBag,
      ParamList,
      NavigatorID,
      MappedProps
    >,
    undefined
  >;
  <
    const Config extends StaticConfig<
      StandardNavigationTypeBagWithNavigator<
        TypeBag,
        ParamListBase,
        string | undefined,
        MappedProps
      >
    >,
  >(
    config: Config &
      StaticConfig<
        StandardNavigationTypeBagWithNavigator<
          TypeBag,
          ParamListBase,
          string | undefined,
          MappedProps
        >
      >
  ): TypedNavigator<
    StandardNavigationTypeBagWithNavigator<
      TypeBag,
      StaticParamList<{ config: Config }> & ParamListBase,
      string | undefined,
      MappedProps
    >,
    Config
  >;
};

export interface StandardNavigationTypeBagBase extends NavigatorTypeBagBase {
  ActionHelpers: {};
  ScreenOptions: {};
  EventMap: EventMapBase;
  NavigatorProps: {};
  RouterOptions: DefaultRouterOptions;
  NavigationList: {
    [RouteName in keyof this['ParamList']]: NavigationProp<
      this['ParamList'],
      RouteName,
      this['NavigatorID'],
      this['State'],
      this['ScreenOptions'],
      this['EventMap']
    > &
      ActionHelpersOf<this['ActionHelpers']>;
  };
}

export function createStandardNavigationFactories<
  TypeBag extends StandardNavigationTypeBagBase,
>(
  standardNavigator: ReturnType<
    typeof createStandardNavigator<
      TypeBag['ScreenOptions'],
      StandardEventMap<TypeBag['EventMap']>,
      TypeBag['NavigatorProps']
    >
  >,
  router: RouterFactory<
    StandardNavigationTypeBagFor<TypeBag, ParamListBase>['State'],
    NavigationAction,
    TypeBag['RouterOptions']
  >
): StandardNavigationFactories<TypeBag, {}>;
export function createStandardNavigationFactories<
  TypeBag extends StandardNavigationTypeBagBase,
>(
  standardNavigator: ReturnType<
    typeof createStandardNavigator<
      TypeBag['ScreenOptions'],
      StandardEventMap<TypeBag['EventMap']>,
      TypeBag['NavigatorProps']
    >
  >,
  router: RouterFactory<
    StandardNavigationTypeBagFor<TypeBag, ParamListBase>['State'],
    NavigationAction,
    TypeBag['RouterOptions']
  >,
  mapProps: StandardNavigationPropsMapper<
    TypeBag,
    Partial<TypeBag['NavigatorProps']>
  >
): StandardNavigationFactories<
  TypeBag,
  RequiredProps<TypeBag['NavigatorProps']>
>;
export function createStandardNavigationFactories<
  TypeBag extends StandardNavigationTypeBagBase,
>(
  {
    type,
    NavigatorContent,
  }: ReturnType<
    typeof createStandardNavigator<
      TypeBag['ScreenOptions'],
      StandardEventMap<TypeBag['EventMap']>,
      TypeBag['NavigatorProps']
    >
  >,
  router: RouterFactory<
    StandardNavigationTypeBagFor<TypeBag, ParamListBase>['State'],
    NavigationAction,
    TypeBag['RouterOptions']
  >,
  mapProps?: StandardNavigationPropsMapper<
    TypeBag,
    Partial<TypeBag['NavigatorProps']>
  >
): StandardNavigationFactories<
  TypeBag,
  RequiredProps<TypeBag['NavigatorProps']>
> {
  type Bag = StandardNavigationTypeBagFor<TypeBag, ParamListBase>;
  type MappedProps = RequiredProps<TypeBag['NavigatorProps']>;
  type StandardArgs = StandardNavigationArgs<
    TypeBag['ScreenOptions'],
    StandardEventMap<TypeBag['EventMap']>
  >;

  if (type !== 'standard') {
    throw new Error(
      `createStandardNavigationFactories only works with standard navigator objects, but got navigator of ${typeof type === 'string' ? `type "${type}".` : 'unknown type.'}`
    );
  }

  function StandardNavigationNavigator(
    props: StandardNavigationNavigatorProps<TypeBag, MappedProps>
  ) {
    const builder = useNavigationBuilder<
      Bag['State'],
      TypeBag['RouterOptions'],
      ActionHelpersOf<Bag['ActionHelpers']>,
      TypeBag['ScreenOptions'],
      TypeBag['EventMap']
    >(router, props);

    const buildHref = useBuildHref();

    const routes = useMemoArray(
      ('preloadedRoutes' in builder.state &&
      Array.isArray(builder.state.preloadedRoutes)
        ? builder.state.routes.concat(
            builder.state.preloadedRoutes as Bag['State']['routes']
          )
        : builder.state.routes
      ).map((route) => {
        const href = buildHref(route.name, route.params);

        return [
          {
            key: route.key,
            name: route.name,
            params: route.params,
            href,
          },
          [route.key, route.name, route.params, href],
        ];
      })
    );

    const state = React.useMemo(
      (): StandardArgs['state'] => ({
        index: builder.state.index,
        routes,
      }),
      [builder.state.index, routes]
    );

    const descriptors: StandardArgs['descriptors'] = {};

    for (const route of state.routes) {
      const descriptor =
        builder.descriptors[route.key] ?? builder.describe(route, true);

      descriptors[route.key] = {
        options: descriptor.options,
        render: descriptor.render,
      };
    }

    const actions = React.useMemo<StandardArgs['actions']>(
      () => ({
        navigate(name, params) {
          builder.navigation.dispatch({
            ...CommonActions.navigate(name, params),
            target: builder.state.key,
          });
        },
        back() {
          builder.navigation.goBack();
        },
      }),
      [builder.navigation, builder.state.key]
    );

    const emitter = React.useMemo<StandardArgs['emitter']>(
      () => ({
        emit: builder.navigation.emit as StandardArgs['emitter']['emit'],
      }),
      [builder.navigation]
    );

    const mappedProps = mapProps?.({
      state: builder.state,
      navigation: builder.navigation as StandardNavigation<TypeBag>,
    });

    // Omit props used by useNavigationBuilder and routers internally
    const {
      /* eslint-disable @typescript-eslint/no-unused-vars */
      id,
      initialRouteName,
      UNSTABLE_routeNamesChangeBehavior,
      children,
      layout,
      screenListeners,
      screenOptions,
      screenLayout,
      UNSTABLE_router,
      /* eslint-enable @typescript-eslint/no-unused-vars */
      ...rest
    } = props;

    return (
      <builder.NavigationContent>
        <NavigatorContent
          {...(rest as TypeBag['NavigatorProps'])}
          {...mappedProps}
          state={state}
          descriptors={descriptors}
          actions={actions}
          emitter={emitter}
        />
      </builder.NavigationContent>
    );
  }

  function createNavigator<
    const ParamList extends ParamListBase,
    const NavigatorID extends string | undefined = string | undefined,
  >(): TypedNavigator<
    StandardNavigationTypeBagWithNavigator<
      TypeBag,
      ParamList,
      NavigatorID,
      MappedProps
    >,
    undefined
  >;
  function createNavigator<
    const Config extends StaticConfig<
      StandardNavigationTypeBagWithNavigator<
        TypeBag,
        ParamListBase,
        string | undefined,
        MappedProps
      >
    >,
  >(
    config: Config
  ): TypedNavigator<
    StandardNavigationTypeBagWithNavigator<
      TypeBag,
      StaticParamList<{ config: Config }> & ParamListBase,
      string | undefined,
      MappedProps
    >,
    Config
  >;
  function createNavigator(config?: unknown) {
    return createNavigatorFactory(StandardNavigationNavigator)(config);
  }

  function createScreen<const Config>(
    config: Config &
      StandardNavigationScreenConfig<TypeBag> &
      StandardNavigationScreenConfigValidation<TypeBag, Config>
  ) {
    return config;
  }

  return {
    createNavigator,
    createScreen,
  };
}
