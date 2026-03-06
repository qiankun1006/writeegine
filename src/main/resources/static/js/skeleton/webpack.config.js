const path = require('path');

module.exports = {
  entry: {
    'skeleton-core': './src/core/index.ts',
    'skeleton-editor': './src/editor/index.ts'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      name: 'SkeletonAnimation',
      type: 'umd',
    },
    globalObject: 'this',
  },
  optimization: {
    minimize: true,
  },
  devtool: 'source-map',
  mode: 'production'
};

