/**
 * Created by kcummings on 9/21/16.
 */
import 'core-js/es6';
import 'core-js/es7/reflect';
import 'core-js/client/shim';
import 'reflect-metadata';
import 'ts-helpers';

require('zone.js/dist/zone');
if (process.env.ENV === 'production') {
    // Production
} else {
    // Development
    Error['stackTraceLimit'] = Infinity;
    require('zone.js/dist/long-stack-trace-zone');
}
