const { metro, patcher, plugin, ui } = vendetta;
const { React } = metro.common;

const MediaEngineActions = metro.findByProps("toggleSelfDeaf", "toggleSelfMute", "toggleSelfVideo");

plugin.storage.fakeMute = plugin.storage.fakeMute ?? false;
plugin.storage.fakeDeafen = plugin.storage.fakeDeafen ?? false;
plugin.storage.fakeVideo = plugin.storage.fakeVideo ?? false;

let patches = [];

module.exports = {
    onLoad: () => {
        if (!MediaEngineActions) return;

        // 1. Intercept Mute
        patches.push(
            patcher.before("setSelfMute", MediaEngineActions, (args) => {
                if (plugin.storage.fakeMute) args[0] = false;
            })
        );

        // 2. Intercept Deafen
        patches.push(
            patcher.before("setSelfDeaf", MediaEngineActions, (args) => {
                if (plugin.storage.fakeDeafen) args[0] = false;
            })
        );

        // 3. Intercept Video
        if (MediaEngineActions.setLocalVideoDisabled) {
            patches.push(
                patcher.before("setLocalVideoDisabled", MediaEngineActions, (args) => {
                    if (plugin.storage.fakeVideo) args[0] = false;
                })
            );
        }
        if (MediaEngineActions.setSelfVideo) {
            patches.push(
                patcher.before("setSelfVideo", MediaEngineActions, (args) => {
                    if (plugin.storage.fakeVideo) args[0] = true;
                })
            );
        }
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
        const [isFakeVideo, setFakeVideo] = React.useState(plugin.storage.fakeVideo);

        return React.createElement(ui.components.Forms.FormSection, { title: "Fake Voice Chat Status" },
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
            }),
            React.createElement(ui.components.Forms.FormSwitchRow, {
                label: "Fake Video",
                subLabel: "Show camera as disabled, but keep streaming your video.",
                value: isFakeVideo,
                onValueChange: (val) => {
                    plugin.storage.fakeVideo = val;
                    setFakeVideo(val);
                    if (MediaEngineActions.toggleSelfVideo) {
                        MediaEngineActions.toggleSelfVideo();
                        setTimeout(() => MediaEngineActions.toggleSelfVideo(), 50);
                    }
                }
            })
        );
    }
};
