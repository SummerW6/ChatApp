import { createApp, watchEffect } from "vue";
import { GraffitiLocal } from "@graffiti-garden/implementation-local";
import { GraffitiRemote } from "@graffiti-garden/implementation-remote";
import { GraffitiPlugin } from "@graffiti-garden/wrapper-vue";
import Header from "./components/Header.js";
import NeonButton from "./components/NeonButton.js";
import Profile from "./components/Profile.js";

const app = createApp({
    data() {
        return {
            channels: ["chatbook"],
            profile: null,
            showMyProfile: false,
            editProfile: {
                username: '',
                displayname: '', 
                role: '',
                bio: ''
            }
        };
    },
    methods: {
        async saveProfile(session) {

        }
    },
    async mounted() {
        watchEffect(async () => {
            if (this.$graffitiSession?.value) {
                const stream = await this.$graffiti.discover(
                    this.channels,
                    {
                        properties: {
                            value: {
                                required: ['activity', 'object'],
                                properties: {
                                    activity: { type: 'string' },
                                    object: {
                                        required: ['type', 'username', 'displayname', 'role', 'bio'],
                                        properties: {
                                            type: { type: 'string' },
                                            username: { type: 'string'},
                                            displayname: { type: 'string' },
                                            role: { type: 'string' },
                                            bio: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    this.$graffitiSession.value,
                )

                const results = [];
                for await (const result of stream) {
                    if (result.object.actor === this.$graffitiSession.value.actor) {
                        results.push(result);
                    }
                }
                if (results.length === 0) {
                    this.showMyProfile = true;
                    const profile = await this.$graffiti.put(
                        {
                            value: {
                                activity: 'Create',
                                object: {
                                    type: 'Profile',
                                    username: this.$graffitiSession.value.actor,
                                    displayname: this.$graffitiSession.value.actor,
                                    role: '',
                                    bio: ''
                                }
                            },
                            channels: this.channels
                        },
                        this.$graffitiSession.value,
                    )
                    this.profile = profile;
                } else {
                    this.profile = results[0];
                }
            }
        });
    }
});

app.use(GraffitiPlugin, {
    graffiti: new GraffitiLocal(),
    // graffiti: new GraffitiRemote(),
});

app.component('header-component', Header);
app.component('neon-button', NeonButton);
app.component('profile', Profile);

app.mount("#app");