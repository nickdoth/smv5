let webpack = require('webpack');
let path = require('path');

module.exports = {
    entry: './src/app.tsx',

    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'built')
    },

    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            minChunks: function (module) {
                // this assumes your vendor imports exist in the node_modules directory
                return module.context && module.context.indexOf('node_modules') !== -1;
            }
        }),
        // new webpack.optimize.UglifyJsPlugin({
        //     compress: {
        //         warnings: false
        //     }
        // })
    ],

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                exclude: /node_modules/,
                options: {
                    "jsx": "react"
                }
            }
        ],
    },

    resolve: {
        extensions: [".tsx", ".ts", ".js"],
        alias: {
            'react-native': 'react-native-web'
        }
    }
}