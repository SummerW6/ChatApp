export default {
    name: 'profile',
    props: {
        showMyProfile: Boolean,
        object: Object

    },
    data() {    
        return {
            value: null,
            options: [
                'Note Sharer',
                'Active',
                'Study Buddy'
            ],
            editProfile: {
                bio: '',
                tags: []
            },
        }

    },
    mounted() {
        if (this.$graffitiSession?.value && this.object){
            this.editProfile.bio = this.object.object.value.bio;
            this.editProfile.tags = this.object.object.value.tags;
        }

    },
    methods: {
        async saveProfile(session, object) {
            await this.$graffiti.patch(
                {
                    value: [{ "op": "replace", "path": "/bio", "value": this.editProfile.bio },
                        { "op": "replace", "path": "/tags", "value": this.editProfile.tags },
                    ],
                    
                },
                object.url,
                session,
            );
        }
    },
    template:`
<div class="overlay" v-if="showMyProfile" @click.self="$emit('close')">
    <div class="profile-popup">
        <div class="profile-popup-header">
            <button @click="$emit('close')">Close</button>
            <h2>Edit Profile</h2>
            <button @click="saveProfile($graffitiSession.value, object.object)">Save</button>
        </div>
        <div class="profile-popup-body">
            <div class="profile-input">
                <input id="username" type="text" :value="$graffitiSession.value.actor" readonly />
                <label for="username">Username</label>
            </div>
            <div class="profile-input">
                <textarea id="bio" maxlength="250" v-model="editProfile.bio"></textarea>
                <label for="Bio">Bio</label>
            </div>
            <div class="profile-tag">
                <v-select 
                v-model='editProfile.tags'
                :options="options"
                placeholder="Select Tags"
                :multiple="true"
                ></v-select>
            </div>
        </div>
    </div>
</div>
    `
}