const { getDefaultConfig } = require('expo/metro-config');

module.exports = (() => {
    const config = getDefaultConfig(__dirname);
    
    // Configuración existente
    config.resolver.sourceExts.push('cjs');
    config.resolver.unstable_enablePackageExports = false;
    
    // Resolver problemas con Hermes y polyfills
    config.resolver.alias = {
      // Polyfill para URL en Hermes
      'react-native-url-polyfill': require.resolve('react-native-url-polyfill'),
    };
    
    return config;
})();