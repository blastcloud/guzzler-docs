module.exports = {
    head: [
        ['link', { rel: 'icon', href: './favicon.png' }]
    ],
    serviceWorker: true,
    themeConfig: {
        logo: '/img/guzzler-logo.svg',
        updatePopup: true,
        nav: [
            { text: 'Home', link: '/'},
        ],
        sidebar: [
            ['getting-started/', 'Getting Started'],
            ['mocking-responses/', 'Mocking Responses'],
            ['expectations/', 'Expectations'],
            ['assertions/', 'Assertions'],
            ['helpers/', 'Helpers']
        ],
        lastUpdated: 'Last Updated',
        repo: "blastcloud/guzzler"
    },
    markdown: {

    },
    evergreen: true
};