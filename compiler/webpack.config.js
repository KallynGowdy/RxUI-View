var webpack = require('webpack');
var nodeExternals = require('webpack-node-externals');

module.exports = {
    entry: {
        'rxui.umd': './src/main',
        'rxui.umd.min': './src/main',
        'rxui.test.umd': './test/main'
    },
    output: {
        filename: '[name].js',
        path: 'bundles',
        library: 'RxUI',
        libraryTarget: 'umd'
    },
    target: 'web',
    externals: [
        {
            "harmony-reflect": "var null",
            "rxjs/Rx": "var Rx",
            "rxjs/scheduler/asap": "var Rx.Scheduler",
            "rxjs/scheduler/queue": "var Rx.Scheduler",
            "bluebird": "var Promise"
        },
        /^[a-z\-0-9\/]+$/
    ],
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            include: /\.min\.js$/,
            minimize: true
        })
    ]
};