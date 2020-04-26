import { Datasources } from './datasources'
import { Core, initCreator, initDesignSystem } from './core'
import { Plugins } from './plugins';
import { getSteedosSchema } from '@steedos/objectql';
import * as migrate from '@steedos/migrate';
import { initPublicStaticRouter } from '../routes';
import { InitI18n } from './i18n';

export async function init() {
    getSteedosSchema();
    WebAppInternals.setInlineScriptsAllowed(false);
    initDesignSystem()
    Plugins.init();
    initCreator();
    await Datasources.init();
    await migrate.init();
    initPublicStaticRouter();
    InitI18n();
    Core.run();
}

export * from './collection';