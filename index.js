import { createApp, watchEffect } from "vue";
import { GraffitiLocal } from "@graffiti-garden/implementation-local";
import { GraffitiRemote } from "@graffiti-garden/implementation-remote";
import { GraffitiPlugin } from "@graffiti-garden/wrapper-vue";
import Profile from "./components/Profile.js";
import MultiSelect from "vue-multiselect";

const app = createApp({
    data() {
        return {
            channels: ["chatbook-mainfeed"],
            profile: null,
            showMyProfile: false,
            myMessage: '',
            showMessagePopUp: false,
            showCreateChatPopUp: false,
            chatOptionsActive: false,
            editUrl: null,
            editContent: "",
            otherProfile: null,
            chat: {
                name:'',
                about: '',
                people: []
            }
        };
    },
    methods: {
        async createChat(session) {
            if (!this.chat.name || !this.chat.about) return;
            this.chat.people.append(this.$graffitiSession.value.actor);
            await this.$graffiti.put(
                {
                    value: {
                        name: this.chat.name,
                        about: this.chat.about,
                        people: this.chat.people,
                    },
                    channels: this.channels,
                },
                session,
            );
            this.chat = {
                name:'',
                about: '',
                people: []
            }
        },
        async sendMessage(session) {
            if (!this.myMessage) return;
            await this.$graffiti.put(
                {
                    value: {
                        content: this.myMessage,
                        published: Date.now(),
                        isDeleted: false,
                        isEdited: false,
                        oldContent: ""
                    },
                    channels: this.channels,
                },
                session,
            );

            this.myMessage = "";
        },
        async updateMessage(session, object, newMessage, isDeleted=false, isEdited=false) {
            await this.$graffiti.patch(
                {
                    value: [{ "op": "replace", "path": "/content", "value": newMessage },
                    { "op": "replace", "path": "/isDeleted", "value": isDeleted },
                    { "op": "replace", "path": "/oldContent", "value": object.value.content },
                    { "op": "replace", "path": "/isEdited", "value": isEdited }
                    ],
                    
                },
                object.url,
                session,
            );
        },
        async deleteMessage(session, object) {
            await this.updateMessage(session, object, "Message was deleted.", true);
        },
        async undoDeleteMessage(session, object) {
            await this.updateMessage(session, object, object.value.oldContent, false);
        },
        editMessage(object) {
            this.editUrl = object.url;
            this.editContent = object.value.content;
        },
        closeMessageEdit() {
            this.editUrl = null;
            this.editContent = "";
        },
        async saveMessageEdit(session, object) {
            await this.updateMessage(session, object, this.editContent, false, true);
            this.closeMessageEdit()
        },
        handleProfileClick(object) {
            this.showMyProfile = this.$graffitiSession.value.actor === object.actor; 
        },

        convertDate(timestamp) {
            const date = new Date(timestamp)
            return date.toLocaleDateString('en-US', {
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
            });
        },
        async showOtherProfile(session, otherActor) {
            const stream = await this.$graffiti.discover(
                this.channels,
                {
                    value: {
                        required: ['type', 'username', 'bio', 'tags'],
                        properties: {
                            type: { type: 'string' },
                            username: { type: 'string'},
                            bio: { type: 'string' },
                            tags: {
                                type: 'array',
                                items: { type: 'string' }
                            }
                        }
                    }
                },
                session,
            )

            // let otherProfile = null;
            for await (const result of stream) {
                console.log(result)
                if (result.object.actor === otherActor) {
                    this.otherProfile = result.object;
                    break;
                }
            }
        },
        handleOtherProfileClose() {
            this.otherProfile = null;
        }
    },
    async mounted() {
        watchEffect(async () => {
            if (this.$graffitiSession?.value) {
                const stream = await this.$graffiti.discover(
                    this.channels,
                    {
                        value: {
                            required: ['type', 'username', 'bio', 'tags'],
                            properties: {
                                type: { type: 'string' },
                                username: { type: 'string'},
                                bio: { type: 'string' },
                                tags: {
                                    type: 'array',
                                    items: { type: 'string' }
                                }
                            }
                        }
                    },
                    this.$graffitiSession.value,
                )

                let results = [];
                for await (const result of stream) {
                    if (result.object.actor === this.$graffitiSession.value.actor) {
                        results.push(result);
                    }
                }
                
                if (results.length === 0) {
                    this.showMyProfile = true;
                    await this.$graffiti.put(
                        {
                            value: {
                                type: 'Profile',
                                username: this.$graffitiSession.value.actor,
                                bio: '',
                                tags: []
                            
                            },
                            channels: this.channels
                        },
                        this.$graffitiSession.value,
                    )
                    const stream = await this.$graffiti.discover(
                        this.channels,
                        {
                            value: {
                                required: ['type', 'username', 'bio', 'tags'],
                                properties: {
                                    type: { type: 'string' },
                                    username: { type: 'string'},
                                    bio: { type: 'string' },
                                    tags: {
                                        type: 'array',
                                        items: { type: 'string' }
                                    }
                                }
                            }
                        },
                        this.$graffitiSession.value,
                    )

                    results = [];
                    for await (const result of stream) {
                        if (result.object.actor === this.$graffitiSession.value.actor) {
                            results.push(result);
                        }
                    }
                } 
                this.profile = results[0];
                
            }
        });
    }
});

app.use(GraffitiPlugin, {
    // graffiti: new GraffitiLocal(),
    graffiti: new GraffitiRemote(),
});

app.component('profile', Profile);
app.component('v-select', MultiSelect);
// app.component('vue-select', window['VueMultiselect'].default)
// Vue.component('v-select', VueSelect.VueSelect);
// app.component('v-select', VueSelect?);

app.mount("#app");