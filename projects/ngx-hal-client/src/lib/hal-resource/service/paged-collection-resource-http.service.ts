import { Injectable } from '@angular/core';
import { BaseResource } from '../model/base-resource';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CacheService } from './cache.service';
import { HttpConfigService } from '../../config/http-config.service';
import { PagedCollectionResource } from '../model/paged-collection-resource';
import { ConsoleLogger } from '../../logger/console-logger';
import { catchError, map } from 'rxjs/operators';
import * as _ from 'lodash';
import { isPagedCollectionResource } from '../model/resource-type';
import { Observable, throwError as observableThrowError } from 'rxjs';
import { ResourceUtils } from '../../util/resource.utils';
import { UrlUtils } from '../../util/url.utils';
import { DependencyInjector } from '../../util/dependency-injector';
import { ConstantUtil } from '../../util/constant.util';
import { PagedGetOption } from '../model/declarations';
import { HttpExecutor } from './http-executor';

/**
 * Get instance of the PagedCollectionResourceHttpService by Angular DependencyInjector.
 */
export function getPagedCollectionResourceHttpService(): PagedCollectionResourceHttpService<PagedCollectionResource<BaseResource>> {
  return DependencyInjector.get(PagedCollectionResourceHttpService);
}

/**
 * Service to perform HTTP requests to get {@link PagedCollectionResource} type.
 */
@Injectable()
export class PagedCollectionResourceHttpService<T extends PagedCollectionResource<BaseResource>> extends HttpExecutor<T> {

  constructor(httpClient: HttpClient,
              cacheService: CacheService<T>,
              private httpConfig: HttpConfigService) {
    super(httpClient, cacheService);
  }

  /**
   * Perform GET request to retrieve paged collection of the resources.
   *
   * @param url to perform request
   * @param options request options
   * @throws error if returned resource type is not paged collection of the resources
   */
  public get(url: string, options?: {
    headers?: {
      [header: string]: string | string[];
    };
    params?: HttpParams | {
      [param: string]: string | string[];
    }
  }): Observable<T> {
    ConsoleLogger.prettyInfo('GET_PAGED_COLLECTION_RESOURCE REQUEST', {
      url,
      params: options?.params
    });

    return super.get(url, {...options, observe: 'body'}).pipe(
      map((data: any) => {
        ConsoleLogger.prettyInfo('GET_PAGED_COLLECTION_RESOURCE RESPONSE', {
          url,
          params: options?.params,
          body: JSON.stringify(data, null, 4)
        });

        if (!isPagedCollectionResource(data)) {
          ConsoleLogger.error('You try to get wrong resource type, expected paged collection resource type.');
          throw Error('You try to get wrong resource type, expected paged collection resource type.');
        }
        const resource: T = ResourceUtils.instantiatePagedCollectionResource(data);
        this.cacheService.putResource(url, resource);

        return resource;
      }),
      catchError(error => observableThrowError(error)));
  }

  /**
   * Perform get paged collection resource request with url built by the resource name.
   *
   * @param resourceName used to build root url to the resource
   * @param query (optional) url path that applied to the result url at the end
   * @param option (optional) options that applied to the request
   */
  public getResourcePage(resourceName: string, query?: string, option?: PagedGetOption): Observable<T> {
    const url = UrlUtils.removeUrlTemplateVars(UrlUtils.generateResourceUrl(this.httpConfig.baseApiUrl, resourceName))
      .concat(query ? query : '');
    if (_.isEmpty(option.page)) {
      option.page = ConstantUtil.DEFAULT_PAGE;
    }
    const httpParams = UrlUtils.convertToHttpParams(option);

    return this.get(url, {params: httpParams});
  }

  /**
   *  Perform search paged collection resource request with url built by the resource name.
   *
   * @param resourceName used to build root url to the resource
   * @param searchQuery name of the search method
   * @param option (optional) options that applied to the request
   */
  public search(resourceName: string, searchQuery: string, option: PagedGetOption): Observable<T> {
    const url = UrlUtils.removeUrlTemplateVars(
      UrlUtils.generateResourceUrl(this.httpConfig.baseApiUrl, resourceName)).concat('/search/' + searchQuery);
    if (_.isEmpty(option) || _.isEmpty(option.page)) {
      option.page = ConstantUtil.DEFAULT_PAGE;
    }
    const httpParams = UrlUtils.convertToHttpParams(option);

    return this.get(url, {params: httpParams});
  }

}
