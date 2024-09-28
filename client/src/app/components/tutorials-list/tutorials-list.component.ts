import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-tutorials-list',
  templateUrl: './tutorials-list.component.html',
  styleUrls: ['./tutorials-list.component.css'],
})
export class TutorialsListComponent implements OnInit {
  makes: any[] = [];
  models: any[] = [];
  years: any[] = [];
  trims: any[] = [];
  engines: any[] = [];
  selectedMake: any;
  selectedModel: any;
  selectedYear: any;
  selectedTrim: any;
  selectedEngine: any;
  disableApiRequests: boolean = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getData('make');
  }

  // Method to get data with optional query parameters
  getData(type: string, query: any = {}) {
    if (!this.disableApiRequests) {
      // Set up query parameters if any exist
      let params = new HttpParams();
      Object.keys(query).forEach((key) => {
        if (query[key]) {
          params = params.append(key, query[key]);
        }
      });

      this.http
        .get<any[]>(`http://localhost:5000/api/${type}`, { params })
        .subscribe((data) => {
          switch (type) {
            case 'make':
              this.makes = data;
              break;
            case 'model':
              this.models = data;
              break;
            case 'year':
              this.years = data;
              break;
            case 'trim':
              this.trims = data;
              break;
            case 'engine':
              this.engines = data;
              break;
          }
        });
    }
  }

  // When the make changes, pass selectedMake as a query param to fetch models
  onMakeChange() {
    this.getData('model', { make: this.selectedMake.make });
    console.log('this.selectedMake', this.selectedMake.make)
  }

  // When the model changes, pass selectedMake and selectedModel to fetch years
  onModelChange() {
    this.getData('year', {
      make: this.selectedMake.make,
      model: this.selectedModel.model,
    });
  }

  // When the year changes, pass make, model, and year to fetch trims
  onYearChange() {
    this.getData('trim', {
      make: this.selectedMake.make,
      model: this.selectedModel.model,
      year: this.selectedYear.year,
    });
  }

  // When the trim changes, pass make, model, year, and trim to fetch engines
  onTrimChange() {
    this.getData('engine', {
      make: this.selectedMake.make,
      model: this.selectedModel.model,
      year: this.selectedYear.year,
      trim: this.selectedTrim.trim,
    });
  }

  // Preview the selected options
  preview() {
    console.log({
      make: this.selectedMake,
      model: this.selectedModel,
      year: this.selectedYear,
      trim: this.selectedTrim,
      engine: this.selectedEngine,
    });
  }

  // Clear the menu and reset the selections
  clearMenu() {
    this.http.post('http://localhost:5000/clear-cache', {}).subscribe(() => {
      this.makes = [];
      this.models = [];
      this.years = [];
      this.trims = [];
      this.engines = [];
      this.selectedMake = null;
      this.selectedModel = null;
      this.selectedYear = null;
      this.selectedTrim = null;
      this.selectedEngine = null;
    });
  }
}
