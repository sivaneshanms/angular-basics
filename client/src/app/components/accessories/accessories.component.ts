import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-accessories',
  templateUrl: './accessories.component.html',
  styleUrls: ['./accessories.component.css'],
})
export class AccessoriesListComponent implements OnInit {
  makes: any[] = [];
  models: any[] = [];
  years: any[] = [];
  trims: any[] = [];
  engines: any[] = [];
  selectedMakes: any[] = [];
  selectedModels: any[] = [];
  selectedYears: any[] = [];
  selectedTrim: any; // Array to hold selected trims
  selectedEngine: any; // Array to hold selected engines
  disableApiRequests: boolean = false;
  showReport: boolean = false;
  combinedTrimEngineList: any[] = []; // Combined list of trim and engine per row
  selectedItems: any[] = [];

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
          console.log('data###',type, '-', data)
          switch (type) {
            case 'make':
              console.log('inside make')
              this.makes = data;
              console.log('this.makes', this.makes)
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
              // this.engines = data;
              // this.combineTrimEngineData();
              break;
            case 'engine':
              console.log('data in engine:', data);
              // this.trims = data;
              this.engines = data;
              // this.combineTrimEngineData();
              break;
            case 'all-filter':
              console.log('data in all-filter:', data);
              // this.trims = data;
              // this.engines = data;
              this.combineTrimEngineData();
              break;
          }
        });
    }
  }

  // When the make changes, fetch models
  onMakeChange() {
    this.getData('model', {
      make: this.selectedMakes.map((make: any) => make.make),
    });
    this.selectedModels = []; // Reset model selection
    this.selectedYears = []; // Reset year selection
    this.trims = []; // Reset trims
    this.engines = []; // Reset engines
    this.selectedTrim = []; // Reset trim selection
    this.selectedEngine = []; // Reset engine selection
  }

  // When the model changes, fetch years
  onModelChange() {
    this.getData('year', {
      make: this.selectedMakes.map((make: any) => make.make),
      model: this.selectedModels.map((model: any) => model.model),
    });
    this.selectedYears = []; // Reset year selection
    this.trims = []; // Reset trims
    this.engines = []; // Reset engines
    this.selectedTrim = []; // Reset trim selection
    this.selectedEngine = []; // Reset engine selection
  }

  // When the year changes, fetch trims
  onYearChange() {
    this.getData('trim', {
      make: this.selectedMakes.map((make: any) => make.make),
      model: this.selectedModels.map((model: any) => model.model),
      year: this.selectedYears.map((year: any) => year.year),
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
    this.getData('engine', {
      make: this.selectedMakes.map((make: any) => make.make),
      model: this.selectedModels.map((model: any) => model.model),
      year: this.selectedYears.map((year: any) => year.year),
      trim: this.selectedTrim.trim,
    });
  }

  onEngineChange() {
    this.getData('all-filter', {
      make: this.selectedMakes.map((make: any) => make.make),
      model: this.selectedModels.map((model: any) => model.model),
      year: this.selectedYears.map((year: any) => year.year),
      trim: this.selectedTrim.trim,
      engine: this.selectedEngine.engine,
    });
  }

  preview() {
    this.showReport = true;
  }

  clearMenu() {
    // this.http.post('http://localhost:5000/clear-cache', {}).subscribe(() => {

    //   this.models = [];
    //   this.years = [];
    //   this.trims = [];
    //   this.engines = [];
    //   this.selectedMake = null;
    //   this.selectedModel = null;
    //   this.selectedYear = null;
    //   this.selectedTrim = [];
    //   this.selectedEngine = [];
    //   this.combinedTrimEngineList = []; // Combined list of trim and engine per row
    //   this.selectedItems = [];
    //   this.showReport = false;
    // });
    this.models = [];
    this.years = [];
    this.trims = [];
    this.engines = [];
    this.selectedMakes = [];
    this.selectedModels = [];
    this.selectedYears = [];
    this.selectedTrim = [];
    this.selectedEngine = [];
    this.combinedTrimEngineList = []; // Combined list of trim and engine per row
    this.selectedItems = [];
    this.showReport = false;
  }

  // Your existing properties...

  // Existing constructor and ngOnInit...

  // toggleTrim(trim: any) {
  //   const trimName = trim.trim; // Ensure you get the correct property

  //   if (this.selectedTrim.includes(trimName)) {
  //     this.selectedTrim = this.selectedTrim.filter((item) => item !== trimName); // Remove if already selected
  //   } else {
  //     this.selectedTrim.push(trimName); // Add if not selected
  //     this.selectedTrim = Array.from(new Set(this.selectedTrim)); // Ensure unique values
  //   }
  // }

  // toggleEngine(engine: any) {
  //   const engineName = engine.engine; // Ensure you get the correct property

  //   if (this.selectedEngine.includes(engineName)) {
  //     this.selectedEngine = this.selectedEngine.filter(
  //       (item) => item !== engineName
  //     ); // Remove if already selected
  //   } else {
  //     this.selectedEngine.push(engineName); // Add if not selected
  //     this.selectedEngine = Array.from(new Set(this.selectedEngine)); // Ensure unique values
  //   }
  // }

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

  engineSearch: string = ''; // Search input for engines

  // Existing constructor and ngOnInit...

  // Filter engines based on search input
  get filteredEngines() {
    return this.combinedTrimEngineList.filter((engine) =>
      engine.engine.toLowerCase().includes(this.engineSearch.toLowerCase())
    );
  }

  // Selected trims and engines per row

  // Combine trims and engines into a single list
  combineTrimEngineData() {
    this.combinedTrimEngineList = [];
    for (let i = 0; i < this.trims.length; i++) {
      if (this.engines[i]) {
        this.combinedTrimEngineList.push({
          trim: this.trims[i].trim,
          engine: this.engines[i].engine,
        });
      }
    }
  }

  // Toggle the selection of an individual trim-engine row
  toggleItemSelection(item: any) {
    const index = this.selectedItems.indexOf(item);
    if (index === -1) {
      this.selectedItems.push(item); // Add item if not selected
    } else {
      this.selectedItems.splice(index, 1); // Remove item if already selected
    }
  }

  // Check if all items are selected
  isAllSelected() {
    return this.selectedItems.length === this.combinedTrimEngineList.length;
  }

  // Select or deselect all rows
  toggleSelectAll() {
    if (this.isAllSelected()) {
      this.selectedItems = [];
    } else {
      this.selectedItems = [...this.combinedTrimEngineList];
    }
  }
}