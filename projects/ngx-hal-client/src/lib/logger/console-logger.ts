import * as _ from 'lodash';

export class ConsoleLogger {

  private static _enabled = false;

  public static info(message?: any, ...optionalParams: any[]): void {
    if (!this.enabled) {
      return;
    }
    console.info(message, ...optionalParams);
  }

  public static error(message?: any, ...optionalParams: any[]): void {
    if (!this.enabled) {
      return;
    }
    console.error(message, ...optionalParams);
  }


  /**
   * Log http request/response with pretty format.
   *
   * @param method method name of the http request (POST, GET)
   * @param type request ot response
   * @param message object with data to log
   */
  // public static logHttp2(method: string, type: string, message: object): void {
  //   if (!this.enabled) {
  //     return;
  //   }
  //
  //   let msg = `%c${ method.toUpperCase() } %c${ type }\n`;
  //   const color = [
  //     'color: #BF3030;',
  //     'color: #00AF64;'
  //   ];
  //
  //   for (const [key, value] of Object.entries(message)) {
  //     msg += `%c${ _.capitalize(key) }: %c${ value }\n`;
  //     color.push('color: #3AA6D0;', 'color: default;');
  //   }
  //
  //   ConsoleLogger.info(msg, ...color);
  // }

  /**
   * Log info messages in pretty format.
   *
   * @param message log message
   * @param params additional params for verbose log
   */
  public static prettyInfo(message: string, params?: object): void {
    if (!this.enabled) {
      return;
    }

    let msg = `%c${ message }\n`;
    const color = [
      'color: #00AF64;'
    ];

    if (!_.isEmpty(params)) {
      for (const [key, value] of Object.entries(params)) {
        msg += `%c${ _.capitalize(key) }: %c${ value }\n`;
        color.push('color: #3AA6D0;', 'color: default;');
      }
    }

    ConsoleLogger.info(msg, ...color);
  }

  /**
   * Log error messages in pretty format.
   *
   * @param message log message
   * @param params additional params for verbose log
   */
  public static prettyError(message: string, params?: object): void {
    if (!this.enabled) {
      return;
    }

    let msg = `%c${ message }\n`;
    const color = [
      'color: #BF3030;'
    ];

    if (!_.isEmpty(params)) {
      for (const [key, value] of Object.entries(params)) {
        msg += `%c${ _.capitalize(key) }: %c${ value }\n`;
        color.push('color: #3AA6D0;', 'color: default;');
      }
    }

    ConsoleLogger.info(msg, ...color);
  }

  static set enabled(value: boolean) {
    this._enabled = value;
  }

  static get enabled(): boolean {
    return this._enabled;
  }

}
