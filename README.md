# Simple Item Filter


This library shows and hides elements based on the CSS classes applied to them. It supports 1 or 2 levels of filters, multiselect, toggling and customizing the class names. Due to the fact that all the items have to be loaded on page load this library is best suited for showing and hiding small numbers of items on a page. If large numbers of items need to be filtered a more advanced system is recommended.

## Getting Started

Follow the instructions below to add and start using this on your site.

### Installing

There are 3 options:

1. jsdeliver (recommended) 

 ```HTML
 <script src="https://cdn.jsdelivr.net/gh/danyoson/simple-item-filter@1.0.0/dist/simple-item-filter.min.js"></script>
 ```

2. Download the latest [release zip](https://github.com/DanYoSon/simple-item-filter/releases) extract it and copy the `simple-item-filter-X.X.X.min.js` to you sites js folder and insert the following script tag into the `<head>` of your page.

 ```HTML
 <script src="PATH/TO/JS/simple-item-filter-X.X.X.min.js"></script>
 ```

3. A plugin for wordpress will be available soon.

### Basic Setup

There are classes that need to be added to your various elements, the prefix to these classes can be configured when initializing the filter. They are as follows:

1. On all "button" elements 
 
 * `sf-btn`
 * Either `sf-btn-primary` or `sf-btn-secondary`
 * The group that they are part of `sf-g-{GROUP}`. This is for multiple filters on a single page.
 * The filter that they will be triggering `sf-f-{FILTER}`. `sf-f-all` if it is to reset the filter.

2. On all "item" elements `sf-item` 

 * `sf-item`
 * The group that they are part of `sf-g-{GROUP}`. This is for multiple filters on a single page.

Once the classes are in place each filter needs to be initialized at minimum as follows.

```JavaScript
$filter = new SimpleItemFilter('{GROUP}');
```

For details on the options avaliable see the documentation in the dist/docs folder.
Examples can be found in the examples folder.

## Contributing

If you find an issue or have a feature request open an [issue](https://github.com/DanYoSon/simple-item-filter/issues) and/or submit a PR. 

### Linting

The js is linted using jslint and the airbnb preset

### Building

Gulp is used to run the build and generate the documentation

```
npm run build
```

resulting files are located in the `dist` folder

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/DanYoSon/simple-item-filter/tags). 

## Authors

* **Daniel Idzerda** - *Initial work* - [DanYoSon](https://github.com/DanYoSon)

See also the list of [contributors](https://github.com/DanYoSon/simple-item-filter/contributors) who participated in this project.

## License

This project is licensed under the GPLv2 or later License - see the [LICENSE.md](LICENSE.md) file for details
