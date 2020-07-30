import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CacheService } from './cache.service';
import { HttpConfigService } from '../../config/http-config.service';
import { Observable, throwError as observableThrowError } from 'rxjs';
import { ConsoleLogger } from '../../logger/console-logger';
import { catchError, map } from 'rxjs/operators';
import { isCollectionResource } from '../model/resource-type';
import { ResourceUtils } from '../../util/resource.utils';
import { CollectionResource } from '../model/collection-resource';
import { BaseResource } from '../model/base-resource';
import { DependencyInjector } from '../../util/dependency-injector';
import { GetOption } from '../model/declarations';
import { UrlUtils } from '../../util/url.utils';
import { HttpExecutor } from './http-executor';

export function getCollectionResourceHttpService(): CollectionResourceHttpService<CollectionResource<BaseResource>> {
  return DependencyInjector.get(CollectionResourceHttpService);
}

/**
 * Service to perform HTTP requests to get {@link CollectionResource} type.
 */
@Injectable()
export class CollectionResourceHttpService<T extends CollectionResource<BaseResource>> extends HttpExecutor<T> {

  constructor(httpClient: HttpClient,
              cacheService: CacheService<T>,
              private httpConfig: HttpConfigService) {
    super(httpClient, cacheService);
  }

  /**
   * Perform GET request to retrieve collection of the resources.
   *
   * @param url to perform request
   * @param options request options
   * @throws error if returned resource type is not collection of the resources
   */
  public get(url: string, options?: {
    headers?: {
      [header: string]: string | string[];
    };
    params?: HttpParams | {
      [param: string]: string | string[];
    }
  }): Observable<T> {
    ConsoleLogger.prettyInfo('GET_COLLECTION_RESOURCE REQUEST', {
      url,
      params: options?.params
    });

    return super.get(url, {...options, observe: 'body'})
      .pipe(
        map((data: any) => {
          ConsoleLogger.prettyInfo('GET_COLLECTION_RESOURCE RESPONSE', {
            url,
            params: options?.params,
            body: JSON.stringify(data, null, 4)
          });

          if (!isCollectionResource(data)) {
            ConsoleLogger.error('You try to get wrong resource type, expected collection resource type.');
            throw new Error('You try to get wrong resource type, expected collection resource type.');
          }

          const resource: T = ResourceUtils.instantiateCollectionResource(data);
          this.cacheService.putResource(url, resource);

          return resource;
        }),
        catchError(error => observableThrowError(error)));
  }

  /**
   * Perform get collection resource request with url built by the resource name.
   *
   * @param resourceName used to build root url to the resource
   * @param query (optional) url path that applied to the result url at the end
   * @param option (optional) options that applied to the request
   */
  public getResourceCollection(resourceName: string, query?: string, option?: GetOption): Observable<T> {
    const url = UrlUtils.generateResourceUrl(this.httpConfig.baseApiUrl, resourceName).concat(query ? query : '');
    const httpParams = UrlUtils.convertToHttpParams(option);

    return this.get(url, {params: httpParams});
  }

  /**
   *  Perform search collection resource request with url built by the resource name.
   *
   * @param resourceName used to build root url to the resource
   * @param searchQuery name of the search method
   * @param option (optional) options that applied to the request
   */
  public search(resourceName: string, searchQuery: string, option?: GetOption): Observable<T> {
    const url = UrlUtils.generateResourceUrl(this.httpConfig.baseApiUrl, resourceName).concat('/search/' + searchQuery);
    const httpParams = UrlUtils.convertToHttpParams(option);

    return this.get(url, {params: httpParams});
  }

}
