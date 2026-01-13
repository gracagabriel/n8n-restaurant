import { Controller as NestController, Get as NestGet } from '@nestjs/common';

function Controller(prefix: string) {
  return function (constructor: Function) {
    Reflect.defineMetadata('path', prefix, constructor);
  };
}

function Get() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata('method', 'GET', descriptor.value);
  };
}

@NestController('health')
export class AppController {
  @NestGet()
  health() {
    return { 
      status: 'ok', 
      database: 'connected', 
      timestamp: new Date().toISOString() 
    };
  }
}
