


var config = {

    all: {
        download: {
            htmlElements: ['img', 'script', 'link', 'style'],
            regex: {
                javascript: [],
                stylesheets: [/url\s*\(([^)]+\.(png|jpg|gif))\)/g],
                htmlFiles: []
            }
        },
        absolutePath: ['a'/*, 'img', 'script', 'link', 'style'*/],
        crawl: null
    },

    // specific configuration to navigate on websites
    websites: {
        'http://www.sapo.pt/': {
            next: {
                selector: '',
                next: {
                    selector: ''
                }
            }
        }
    }

};


module.exports = config;