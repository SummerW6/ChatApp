export default {
    name: 'profile',
    props: {
        showMyProfile: Boolean
    },
    template:`
        <div class="overlay" v-if="showMyProfile">
            <div class="profile-popup">
                <div class="profile-popup-header">
                    <button @click="$emit('close')">Close</button>
                    <h2>Edit Profile</h2>
                    <button @click="saveProfile($graffitiSession)">Save</button>
                </div>
                <div class="profile-popup-body">
                    <div class="profile-input">
                        <input id="username" type="text" :value="$graffitiSession.value.actor" readonly />
                        <label for="username">Username</label>
                    </div>
                    <div class="profile-input">
                        <input id="displayName" type="text" :value="$graffitiSession.value.actor" />
                        <label for="displayname">Display Name</label>
                    </div>
                    <div class="toggle">
                        <span>Student</span>
                        <label class="switch">
                            <input type="checkbox">
                            <span class="slider"></span>
                        </label>
                        <span>Teacher</span>
                    </div>
                    <div class="profile-input">
                        <textarea id="bio" maxlength="250"></textarea>
                        <label for="Bio">Bio</label>
                    </div>
                </div>
            </div>
        </div>
    `
}