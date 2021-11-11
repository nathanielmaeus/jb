const HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const path = require('path');

module.exports = {
    entry: './frontend/src/index.ts',
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.ts|tsx|js|jsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.scss$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: true,
                            modules: {
                                localIdentName: "[name]__[local]___[hash:base64:5]",
                            },
                        },
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: true,
                        },
                    },
                ],
            },
            {
                test: /\.(jpg)$/i,
                use: [
                    'file-loader',
                ],
            },
        ],
    },
    resolve: {
        alias: {
            '~': path.resolve('./frontend/src'),
        },
        extensions: ['.js', '.ts', '.tsx', 'jsx'],
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'frontend', 'dist'),
        publicPath: '/',
    },
    plugins: [
        new Dotenv(),
        new HtmlWebpackPlugin({
            inject: true,
            template: path.resolve('./frontend/public/index.html'),
        }),
    ],
    devServer: {
        historyApiFallback: true,
        contentBase: './',
        hot: true
    }
};
