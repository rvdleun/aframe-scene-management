const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
    entry: './example/index.js',
    devServer: {
        contentBase: path.resolve(__dirname, 'example', 'public'),
        hot: true,
        port: 8000,
        watchContentBase: true,
    },
    plugins: [
        new CopyWebpackPlugin([
            { from: 'example/public' }
        ],
        {
            ignore: ['index.html']
        }),
        new HtmlWebpackPlugin({
            inject: 'head',
            template: 'example/public/index.html'
        }),
    ]
};
