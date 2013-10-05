


var config = {

    all: {
        download: {
            htmlElements: ['img', 'script', 'link', 'style'],
            regex: [
                '\b.*.jpg\b', '\b.*.jpeg\b', '\b.*.png\b', '\b.*.gif\b'
            ]
        },
        absolutePath: ['a'/*, 'img', 'script', 'link', 'style'*/],
        crawl: null
    },

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