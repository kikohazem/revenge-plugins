const { metro, patcher, plugin, ui } = window.vendetta;
const { React } = metro.common;

const MediaEngineActions = metro.findByProps("toggleSelfDeaf", "toggleSelfMute");

plugin.storage.fakeMute = plugin.storage.fakeMute ?? false;
plugin.storage.fakeDeafen = plugin.storage.fakeDeafen ?? false;

let patches = [];

export default {
    onLoad: () => {
        if (!MediaEngineActions) return;

        // Intercept the Mute Command
        patches.push(
            patcher.before("setSelfMute", MediaEngineActions, (args) => {
                if (plugin.storage.fakeMute) args[0] = false;
            })
        );

        // Intercept the Deafen Command
        patches.push(
            patcher.before("setSelfDeaf", MediaEngineActions, (args) => {
                if (plugin.storage.fakeDeafen) args[0] = false;
            })
        );
    },

    onUnload: () => {
        for (const unpatch of patches) {
            unpatch();
        }
        patches = [];
    },

    settings: () => {
        const [isFakeMute, setFakeMute] = React.useState(plugin.storage.fakeMute);
        const [isFakeDeafen, setFakeDeafen] = React.useState(plugin.storage.fakeDeafen);

        return React.createElement(ui.components.Forms.FormSection, { title: "Fake Voice Status" },
            React.createElement(ui.components.Forms.FormSwitchRow, {
                label: "Fake Mute",
                subLabel: "Show as muted to others, but keep your mic active.",
                value: isFakeMute,
                onValueChange: (val) => {
                    plugin.storage.fakeMute = val;
                    setFakeMute(val);
                    MediaEngineActions.toggleSelfMute();
                    setTimeout(() => MediaEngineActions.toggleSelfMute(), 50);
                }
            }),
            React.createElement(ui.components.Forms.FormSwitchRow, {
                label: "Fake Deafen",
                subLabel: "Show as deafened to others, but keep hearing audio.",
                value: isFakeDeafen,
                onValueChange: (val) => {
                    plugin.storage.fakeDeafen = val;
                    setFakeDeafen(val);
                    MediaEngineActions.toggleSelfDeaf();
                    setTimeout(() => MediaEngineActions.toggleSelfDeaf(), 50);
                }
            })
        );
    }
};
