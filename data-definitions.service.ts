import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { AuthHttp } from 'angular2-jwt';
import { environment } from '../../environments/environment';
import { DataDefinition } from '../models/data-definition';

@Injectable()
export class DataDefinitionsService {

  constructor(private authHttp: AuthHttp) {
  }

  getDataDefinitions(): Observable<DataDefinition[]> {
    return this.authHttp.get(environment.apiBaseUrl + 'api/v1/data-defs')
      .map((response: Response) => response.json());
  }

  addDataDefinition(dataDefinition: Object): Observable<any> {
    return this.authHttp.post(environment.apiBaseUrl + 'api/v1/data-defs', dataDefinition)
      .map((response: Response) => response.json())
      .catch((error: any) => Observable.throw({message: 'API Error'}));
  }

  getDataDefinition(id: String): Observable<DataDefinition[]> {
    return this.authHttp.get(environment.apiBaseUrl + 'api/v1/data-defs/' + id)
      .map((response: Response) => response.json());
  }

  updateDataDefinition(dataDefinition: Object): Observable<DataDefinition[]> {
    const apiUrl = environment.apiBaseUrl + 'api/v1/data-defs';
    const url = `${apiUrl}/${dataDefinition['id']}`;
    return this.authHttp.put(url, dataDefinition)
      .map((response: Response) => response.json())
      .catch((error: any) => Observable.throw(error.json().error || {message: 'Server Error'}));
  }

  deleteDataDefinition(id: String): Observable<DataDefinition[]> {
    const apiUrl = environment.apiBaseUrl + 'api/v1/data-defs';
    const url = `${apiUrl}/${id}`;
    return this.authHttp.delete(url)
      .map((response: Response) => response.json())
      .catch((error: any) => Observable.throw(error.json().error || {message: 'Server Error'}));
  }

}
