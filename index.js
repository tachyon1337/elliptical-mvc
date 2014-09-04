


module.exports={
    Class:require('./lib/class/class'),
    Model:require('./lib/model/model'),
    Controller:require('./lib/controller/controller'),
    View:require('./lib/view/view'),
    Provider:require('./lib/provider/provider'),
    $Provider:require('./lib/provider/providerFactory'),
    Service:require('./lib/service/service'),
    proto:require('./lib/proto/proto'),
    async:require('async'),
    debounce:require('./lib/process/debounce'),
    throttle:require('./lib/process/throttle'),
    Interval:require('./lib/process/interval'),
    factory:require('./lib/factory/factory'),
    noop:require('./lib/noop/noop')
};




