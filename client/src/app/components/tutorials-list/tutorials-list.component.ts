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
  selectedMake: any = null;
  selectedModel: any = null;
  selectedYear: any = null;
  selectedTrim: any[] = []; // Array to hold selected trims
  selectedEngine: any[] = []; // Array to hold selected engines
  disableApiRequests: boolean = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getData('make');
  }

  getData(type: string, query: any = {}) {
    if (!this.disableApiRequests) {
      let params = new HttpParams();
      Object.keys(query).forEach((key) => {
        if (query[key]) {
          params = params.append(key, query[key]);
        }
      });

      this.http
        .get<any[]>(`http://localhost:5000/api/${type}`, { params })
        .subscribe((data: any) => {
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
              
          console.log('data in trim:', data);
              this.trims = data;
              this.engines = data;
              break;
          }
        });
    }
  }

  // When the make changes, fetch models
  onMakeChange() {
    this.getData('model', { make: this.selectedMake.make });
    this.selectedModel = null; // Reset model selection
    this.selectedYear = null; // Reset year selection
    this.trims = []; // Reset trims
    this.engines = []; // Reset engines
    this.selectedTrim = []; // Reset trim selection
    this.selectedEngine = []; // Reset engine selection
  }

  // When the model changes, fetch years
  onModelChange() {
    this.getData('year', {
      make: this.selectedMake.make,
      model: this.selectedModel.model,
    });
    this.selectedYear = null; // Reset year selection
    this.trims = []; // Reset trims
    this.engines = []; // Reset engines
    this.selectedTrim = []; // Reset trim selection
    this.selectedEngine = []; // Reset engine selection
  }

  // When the year changes, fetch trims
  onYearChange() {
    this.getData('trim', {
      make: this.selectedMake.make,
      model: this.selectedModel.model,
      year: this.selectedYear.year,
    });
    // this.getData('engine', {
    //   make: this.selectedMake.make,
    //   model: this.selectedModel.model,
    //   year: this.selectedYear.year,
    // });
    this.engines = []; // Reset engines
    this.selectedEngine = []; // Reset engine selection
  }

  // When the trim changes, fetch engines
  onTrimChange() {
    
  }

  preview() {
    console.log({
      make: this.selectedMake,
      model: this.selectedModel,
      year: this.selectedYear,
      trims: this.selectedTrim,
      engines: this.selectedEngine,
    });
  }

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
      this.selectedTrim = [];
      this.selectedEngine = [];
    });
  }

  // Your existing properties...
  

  // Existing constructor and ngOnInit...

  toggleTrim(trim: any) {
    const trimName = trim.trim; // Ensure you get the correct property

    if (this.selectedTrim.includes(trimName)) {
      this.selectedTrim = this.selectedTrim.filter(item => item !== trimName); // Remove if already selected
    } else {
      this.selectedTrim.push(trimName); // Add if not selected
      this.selectedTrim = Array.from(new Set(this.selectedTrim)); // Ensure unique values
    }
  }

  toggleEngine(engine: any) {
    const engineName = engine.engine; // Ensure you get the correct property

    if (this.selectedEngine.includes(engineName)) {
      this.selectedEngine = this.selectedEngine.filter(item => item !== engineName); // Remove if already selected
    } else {
      this.selectedEngine.push(engineName); // Add if not selected
      this.selectedEngine = Array.from(new Set(this.selectedEngine)); // Ensure unique values
    }
  }


  // Existing methods...



  // Select All for Trims
  toggleSelectAllTrims() {
    if (this.selectedTrim.length === this.trims.length) {
      this.selectedTrim = []; // Deselect all if already selected
    } else {
      this.selectedTrim = this.trims.map((trim) => trim.trim); // Select all trims
    }
  }

  // Select All for Engines
  toggleSelectAllEngines() {
    if (this.selectedEngine.length === this.engines.length) {
      this.selectedEngine = []; // Deselect all if already selected
    } else {
      this.selectedEngine = this.engines.map((engine) => engine.engine); // Select all engines
    }
  }

  // Function to toggle individual trim selection
  toggleTrim1(trim: any) {
    const index = this.selectedTrim.indexOf(trim.trim);
    if (index === -1) {
      // If not found, add to the selection
      this.selectedTrim.push(trim.trim);
    } else {
      // If found, remove from the selection
      this.selectedTrim.splice(index, 1);
    }
  }

  // Function to toggle individual engine selection
  toggleEngine1(engine: any) {
    const index = this.selectedEngine.indexOf(engine.engine);
    if (index === -1) {
      // If not found, add to the selection
      this.selectedEngine.push(engine.engine);
    } else {
      // If found, remove from the selection
      this.selectedEngine.splice(index, 1);
    }
  }

}