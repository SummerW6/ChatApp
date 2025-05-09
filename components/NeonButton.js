export default {
    name: 'neon-button',
    props: {
        buttonText: {
            type: String,
            required: true
        }
    },
    template:`
    <button class="btn-76">
        {{ buttonText }}
        <span class="top"></span>
        <span class="right"></span>
        <span class="bottom"></span>
        <span class="left"></span>
    </button>
    `
}