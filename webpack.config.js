const path = require("path");
const VueLoaderPlugin = require("vue-loader/lib/plugin");
module.exports = {
  entry: {
    "simple-vue-swiper": path.join(__dirname, "src/simple-vue-swiper.vue")
  },
  output: {
    path: path.join(__dirname, "dist"),
    publicPath: "/",
    library: "simpleVueSwiper",
    libraryTarget: "umd",
    libraryExport: "default",
    filename: "[name].js"
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: "vue-loader"
      },
      {
        test: /\.js$/,
        loader: "babel-loader",
        options: {
          presets: ['@babel/preset-env']
        }
      },
      {
        test: /\.scss$/,
        use: ["vue-style-loader", "css-loader", "sass-loader"]
      }
    ]
  },
  plugins: [new VueLoaderPlugin()]
};
