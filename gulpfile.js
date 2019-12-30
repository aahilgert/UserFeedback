const babel = require("rollup-plugin-babel");
const browserSync = require("browser-sync").create();
const commonjs = require("rollup-plugin-commonjs");
const concat = require("gulp-concat");
const cssLint = require("stylelint"); // linter
const cssMinify = require("cssnano"); // minifier
const cssPolyfills = require("postcss-preset-env"); // autoprefixer + polyfills
const gulp = require("gulp");
const postcss = require("gulp-postcss"); // css
const rename = require("gulp-rename");
const replace = require("gulp-replace");
const resolve = require("rollup-plugin-node-resolve");
const rollup = require("gulp-better-rollup");
const runSequence = require("gulp4-run-sequence");
const sass = require("@csstools/postcss-sass"); // sass compiler
const sass_ = require("gulp-sass");
const sourcemaps = require("gulp-sourcemaps");
const svgSprite = require("gulp-svg-sprite");
const { eslint } = require("rollup-plugin-eslint");
const { terser } = require("rollup-plugin-terser");

const styleModules = [
  {
    app: "user_feedback",
    modules: ["styles"]
  }
];

const scriptModules = [
  {
    app: "user_feedback",
    modules: ["scripts"]
  }
];

const templateModules = ["metrics"];

const babelConfig = {
  babelrc: false,
  exclude: ["node_modules/**"],
  plugins: [
    "@babel/plugin-proposal-class-properties",
    ["@babel/plugin-transform-react-jsx", { pragma: "h" }]
  ],
  presets: [
    "@babel/preset-flow",
    [
      "@babel/preset-env",
      {
        targets: {
          browsers: "last 4 versions and >=0.2% in CA and not ie <= 11"
        },
        useBuiltIns: "usage",
        corejs: 3
      }
    ]
  ]
};

/* TASKS */

async function buildStyle(app, module) {
  return gulp
    .src(
      [
        `./${app}/static/${app}/styles/${module}/**/*.scss`,
        `./${app}/static/${app}/styles/${module}.scss`
      ],
      {
        allowEmpty: true
      }
    )
    .pipe(sourcemaps.init())
    .pipe(
      sass_({
        outputStyle: "compressed",
        includePaths: "./node_modules"
      })
    )
    .on("error", function(err) {
      console.log(err.toString());
      this.emit("end"); // eslint-disable-line
    })
    .pipe(postcss([cssLint(), cssPolyfills(), cssMinify()]))
    .pipe(concat(`${module}.min.css`))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(`./${app}/static/${app}/styles`))
    .pipe(browserSync.stream());
}

async function buildScript(app, module) {
  return gulp
    .src(`./${app}/static/${app}/scripts/${module}.js`)
    .pipe(sourcemaps.init())
    .pipe(
      rollup(
        {
          plugins: [
            eslint({
              exclude: ["**.css"]
            }),
            babel(babelConfig),
            resolve({
              mainFields: ["jsnext", "module", "main", "browser"]
            }),
            commonjs(),
            terser()
          ],
          onwarn(warning, warn) {
            if (warning.code == "CIRCULAR_DEPENDENCY") {
              return;
            } else {
              warn(warning);
            }
          },
          external: ["d3"]
        },
        { name: module, format: "iife", globals: { d3: "d3" } }
      )
    )
    .on("error", function(err) {
      console.log(err.toString());
      this.emit("end"); // eslint-disable-line
    })
    .pipe(rename(`${module}.min.js`))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(`./${app}/static/${app}/scripts/`))
    .pipe(browserSync.stream());
}

function icons() {
  return gulp
    .src("./ss_kpi/static/assets/icons/*.svg")
    .pipe(
      svgSprite({
        mode: {
          symbol: {
            inline: true
          }
        },
        svg: {
          namespaceIDs: false
        }
      })
    )
    .pipe(
      replace(
        'width="0" height="0" style="position:absolute"', // eslint-disable-line
        'id="icon-sprite"' // eslint-disable-line
      )
    )
    .pipe(rename("icons.svg"))
    .pipe(gulp.dest("./ss_kpi/templates/"));
}

function watchStyle(app, module) {
  gulp.watch(
    [
      `./${app}/static/${app}/styles/${module}/**/*.scss`,
      `./${app}/static/${app}/styles/${module}.scss`
    ],
    () => buildStyle(app, module)
  );
}

function watchScript(app, module) {
  gulp.watch(
    [
      `./${app}/static/${app}/scripts/_${module}/**/*.js`,
      `./${app}/static/${app}/scripts/${module}.js`
    ],
    () => buildScript(app, module)
  );
}

function watch() {
  browserSync.init({
    port: 3000,
    proxy: "http://127.0.0.1:8000",
    notify: false,
    open: false
  });
  styleModules.forEach(app =>
    app.modules.forEach(module => watchStyle(app.app, module))
  );
  scriptModules.forEach(app =>
    app.modules.forEach(module => watchScript(app.app, module))
  );
  templateModules.forEach(app =>
    gulp
      .watch(`./${app}/templates/${app}/**/*.html`)
      .on("change", browserSync.reload)
  );
}

const styles = gulp.parallel(
  ...styleModules.reduce(
    (acc, app) => [
      ...acc,
      app.modules.map(module => () => buildStyle(app.app, module))
    ],
    []
  )
);

const scripts = gulp.parallel(
  ...scriptModules.reduce(
    (acc, app) => [
      ...acc,
      app.modules.map(module => () => buildScript(app.app, module))
    ],
    []
  )
);

const build_ = gulp.parallel(styles, scripts, icons);

// Build scss files
gulp.task("build-scss", function() {
  const plugins = [cssLint({ fix: true }), sass(), cssPolyfills(), cssMinify()];
  return gulp
    .src([
      "./static_content/all_colleges/css/*.scss",
      "./metrics/static/metrics/css/*.scss"
    ])
    .pipe(postcss([plugins[0]])) // Force inline fix before processing
    .pipe(
      gulp.dest(function(file) {
        return file.base;
      })
    )
    .pipe(
      rename(function(path) {
        path.extname = ".css";
      })
    )
    .pipe(postcss(plugins.slice(1)))
    .pipe(gulp.dest("./static_content/all_colleges/css/"));
});

// Run rollup to bundle js
gulp.task("build-js", function(callback) {
  const runCommand = require("child_process").execSync;
  runCommand("./node_modules/.bin/rollup -c", function(err, stdout, stderr) {
    console.log("Output: " + stdout);
    console.log("Error: " + stderr);
    if (err) {
      console.log("Error: " + err);
    }
  });
  // Call the callback to signal completion
  callback();
});

gulp.task("build", function(callback) {
  runSequence("build-scss", "build-js", callback);
});

exports.build_ = build_;
exports.styles = styles;
exports.scripts = scripts;
exports.icons = icons;
exports.watch = watch;
