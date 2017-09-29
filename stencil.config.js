exports.config = {
  namespace: 'wcbs',
  generateDistribution: true,
  bundles: [
    { components: ['bs-pagination'] }
  ]
};

exports.devServer = {
  root: 'www',
  watchGlob: '**/**'
}
