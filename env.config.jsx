import AccountInformationAfterLocationSlot from './src/plugin-slots/AccountInformationAfterLocationSlot';
import ProfileInformationAfterDefaultsSlot from './src/plugin-slots/ProfileInformationAfterDefaultsSlot';

function addPlugins(config, slotName, plugins) {
  if (slotName in config.pluginSlots === false) {
    config.pluginSlots[slotName] = {
      keepDefault: true,
      plugins: [],
    };
  }

  config.pluginSlots[slotName].plugins.push(...plugins);
}

async function setConfig() {
  const config = { pluginSlots: {} };

  try {
    const { DIRECT_PLUGIN, PLUGIN_OPERATIONS } = await import('@openedx/frontend-plugin-framework');

    if (process.env.APP_ID === 'account') {
      addPlugins(config, 'org.skilredi.frontend.account.account_information_after_location.v1', [{
        op: PLUGIN_OPERATIONS.Insert,
        widget: {
          id: 'skilredi_account_information_after_location',
          type: DIRECT_PLUGIN,
          priority: 10,
          RenderWidget: AccountInformationAfterLocationSlot,
        },
      }]);

      addPlugins(config, 'org.skilredi.frontend.account.profile_information_after_defaults.v1', [{
        op: PLUGIN_OPERATIONS.Insert,
        widget: {
          id: 'skilredi_profile_information_after_defaults',
          type: DIRECT_PLUGIN,
          priority: 10,
          RenderWidget: ProfileInformationAfterDefaultsSlot,
        },
      }]);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('env.config.jsx failed to apply: ', err);
  }

  return config;
}

export default setConfig;
