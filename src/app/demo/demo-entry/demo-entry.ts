import { Component } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ImageModule } from 'primeng/image';
// PrimeNG modules
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { DatePickerModule } from 'primeng/datepicker';
import { FileUploadModule } from 'primeng/fileupload';

// Services
import { DemoDataService } from '../services/demo.data.service';
import { InformationService } from '../../shared/services/information-service';
import { EntityState, GlobalMethods } from '../../shared/models/javascriptMethods';
import { ActivatedRoute } from '@angular/router';
import { LoadingService } from '../../shared/services/loading-service';

@Component({
  selector: 'app-demo-entry',
  standalone: true,
  templateUrl: './demo-entry.html',
  styleUrls: ['./demo-entry.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    DatePickerModule,
    ButtonModule,
    DividerModule,
    CardModule,
    TableModule,
    FileUploadModule,
    ImageModule
  ],
})
export class DemoEntry {
  form: FormGroup;
  id: number = 0;
  fileUrl: any = GlobalMethods.FileUrl();
  EntityState: any = EntityState;
  tempData: any;
  constructor(
    private fb: FormBuilder,
    private dataSvc: DemoDataService,
    private msgSvc: InformationService,
    private route: ActivatedRoute,
    private loadingService: LoadingService
  ) { }

  ngOnInit() {

    this.setFormData();
    this.route.queryParams.subscribe(params => {
      this.id = params['id'] || '';
      if (this.id) {
        this.getDemoById();

      } else {
        // Start with one default item
        this.addItem();
      }
    });
  }

  setFormData() {
    try {
      this.form = this.fb.group({
        id: 0,
        name: [null, Validators.required],
        createDate: [new Date(), Validators.required],
        isActive: false,
        demoItems: this.fb.array([]),
      });


    } catch (err) {
      this.msgSvc.showErrorMsg(err);
    }
  }

  getDemoById() {
    try {
      this.dataSvc.getDemoById(this.id).subscribe({
        next: (res) => {
          this.tempData = res.data[0];
          this.loadDemoForEdit(res.data[0]);
        }
        , error: (err) => {
          this.msgSvc.showErrorMsg(err);
        }
      });
    } catch (error) {
      throw error;
    }
  }

  // FormArray getters
  get demoItems(): FormArray {
    return this.form.get('demoItems') as FormArray;
  }

  attachmentsAt(itemIndex: number): FormArray {
    return this.demoItems.at(itemIndex).get('demoItemFileAttachments') as FormArray;
  }

  // Build new item
  private buildItem(): FormGroup {
    return this.fb.group({
      id: 0,
      demoId: 0,
      name: [null, Validators.required],
      title: null,
      description: null,
      isActive: false,
      tag: EntityState.Added,
      demoItemFileAttachments: this.fb.array([]),
    });
  }

  // Build new attachment
  private buildAttachment(): FormGroup {
    return this.fb.group({
      id: 0,
      demoItemId: 0,
      fileName: [null, Validators.required],
      filePath: null,
      prvFileName: null,
      folderNAme: null,
      isActive: false,
      previewUrl: null,
      selectedFile: null,
      isDeleted: false,
      tag: EntityState.Added,
    });
  }

  // Add / Remove items
  addItem() {
    this.demoItems.push(this.buildItem());
  }

  removeItem(i: number) {
    if (this.demoItems.controls.length == 1) {
      this.msgSvc.showWarningMsg("There must be atleast an item.");
      return;
    }
    const item = this.demoItems.at(i);
    if (item.value.id && item.value.id > 0) {
      item.patchValue({ tag: EntityState.Deleted });
    } else {
      this.demoItems.removeAt(i);
    }
  }

  // Add / Remove attachments
  addAttachment(itemIndex: number) {
    this.attachmentsAt(itemIndex).push(this.buildAttachment());
  }

  removeAttachment(itemIndex: number, attIndex: number) {
    const control = this.attachmentsAt(itemIndex).at(attIndex);
    if (control.value.id && control.value.id > 0) {
      control.patchValue({ tag: EntityState.Deleted });
      control['selectedFile'] = null;
      control['previewUrl'] = null;
    } else {
      this.attachmentsAt(itemIndex).removeAt(attIndex);
    }
  }

  // Track field changes for Modified
  private markAsModified(control: AbstractControl) {
    if (control instanceof FormGroup) {
      Object.values(control.controls).forEach(ctrl => {
        // Recursively mark child controls
        this.markAsModified(ctrl);
      });
      control.patchValue({ tag: EntityState.Modified }, { emitEvent: false });
    } else if (control instanceof FormArray) {
      control.controls.forEach(ctrl => this.markAsModified(ctrl));
    } else if (control instanceof FormControl) {
      // just mark touched if needed
      control.markAsTouched();
    }
  }


  // File selection
  onFileSelect(event: any, itemIndex: number, attIndex: number) {
    const file = event.files?.[0];
    if (!file) return;

    const control = this.attachmentsAt(itemIndex).at(attIndex);
    //unique file name
    const fileName = itemIndex + '_' + attIndex + '_' + file.name;
    // Update file info
    control.get('fileName')?.setValue(fileName);
    control.get('prvFileName')?.setValue(file.name);
    control['selectedFile'] = file;

    // Generate preview
    const reader = new FileReader();
    reader.onload = () => (control['previewUrl'] = reader.result as string);
    reader.readAsDataURL(file);

    // If this attachment exists in DB, mark as Modified
    if (control.value.id && control.value.id > 0 && control.value.tag !== EntityState.Added) {
      control.patchValue({ tag: EntityState.Modified }, { emitEvent: false });
    }
  }

  // Load demo for editing
  loadDemoForEdit(demo: any) {
    this.form.patchValue({
      id: demo.id,
      name: demo.name,
      createDate: demo.createDate ? new Date(demo.createDate) : null,
      isActive: demo.isActive,
    });

    this.demoItems.clear();

    demo.demoItems.forEach((item: any) => {
      const itemGroup = this.fb.group({
        id: item.id,
        demoId: item.demoId,
        name: [item.name, Validators.required],
        title: item.title,
        description: item.description,
        isActive: item.isActive,
        tag: EntityState.Modified,
        demoItemFileAttachments: this.fb.array([]),
      });

      const attachmentsArray = itemGroup.get('demoItemFileAttachments') as FormArray;
      item.demoItemFileAttachments.forEach((att: any) => {
        attachmentsArray.push(this.fb.group({
          id: att.id,
          demoItemId: att.demoItemId,
          fileName: att.fileName,
          filePath: GlobalMethods.fileFolders.demo + "/" + item.id + "/" + att.fileName,
          prvFileName: att.fileName,
          previewUrl: `/uploads/${att.fileName}`, // optional preview
          selectedFile: null,
          isDeleted: false,
          tag: EntityState.Unchanged,
        }));
      });

      this.demoItems.push(itemGroup);
    });
  }

  // Submit FormData
  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loadingService.show();
    const formData = new FormData();
    this.demoItems.controls.forEach((item, i) => {
      if (item.get('id').value > 0) {
        if (item.get('tag').value != EntityState.Deleted)
          item.patchValue({ tag: EntityState.Modified });
      }
      const attachments = item.get('demoItemFileAttachments') as FormArray;
      attachments.controls.forEach((att, j) => {
        if (item.get('tag').value == EntityState.Deleted) {
          att.patchValue({ tag: EntityState.Deleted });
        } else {
          var file: File = att['selectedFile'];
          if (file && att.value.tag !== EntityState.Deleted) {
            //Set Unique FileName
            const fileName = i + '_' + j + '_' + file.name;
            formData.append(`files`, file, fileName);
          }
        }
      });
    });
    const data = this.form.value;
    formData.append('demo', JSON.stringify(data));
    this.dataSvc.save(formData).subscribe({
      next: (res) => {
        this.loadingService.hide();
        this.msgSvc.showSuccessMsg('Saved successfully');
        // Load updated demo if backend returns updated data
        this.loadDemoForEdit(res.data);
        //this.resetForm();
      },
      error: (err) => {
        this.msgSvc.showErrorMsg(err.error.message);
        this.loadingService.hide();
      },
    });
  }

  // Reset form
  resetForm() {
    try {
      if (this.id) {
        this.loadDemoForEdit(this.tempData);
      }
      else {
        this.form.reset({ isActive: false });
        this.demoItems.clear();
        this.addItem();
      }
    } catch (error) {
      this.msgSvc.showErrorMsg(error);
    }
  }

  clearForm() {
    try {
      this.setFormData();
      this.addItem();
    } catch (error) {
      this.msgSvc.showErrorMsg(error);
    }
  }
}
