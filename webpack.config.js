module.exports = {
    entry: './src/app.tsx',
    output: {
        filename: 'built/app.js'
    },

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