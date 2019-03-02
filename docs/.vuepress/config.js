module.exports = {
    favicon: './favicon.png',
    themeConfig: {
        logo: 'img/guzzler-logo.svg',
        updatePopup: true,
        nav: [
            { text: 'Home', link: '/'},
        ],
        sidebar: [
            ['/', 'Home'],
            ['getting-started/', 'Getting Started'],
            ['mocking-responses/', 'Mocking Responses'],
            ['expectations/', 'Expectations'],
            ['assertions/', 'Assertions'],
            ['helpers/', 'Helpers']
        ],
        lastUpdated: 'Last Updated',
        repo: "blastcloud/guzzler"
    }
};