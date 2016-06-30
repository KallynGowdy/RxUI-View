var webpack = require('webpack');

module.exports = {
    entry: {
        'rxui-view.umd': './index',
        'rxui-view.umd.min': './index',
        'rxui-view.test.umd': './test/index'
    },
    output: {
        filename: '[name].js',
        path: 'bundles',
        library: 'RxUIView',
        libraryTarget: 'umd'
    },
    target: 'web',
    externals: [
        {
            "rxjs/Rx": "var Rx",
            "rxjs/scheduler/asap": "var Rx.Scheduler",
            "rxjs/scheduler/queue": "var Rx.Scheduler",
            "bluebird": "var Promise",
            "rxui": "var RxUI"
        }
    ],
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            include: /\.min\.js$/,
            minimize: true
        })
    ]
};