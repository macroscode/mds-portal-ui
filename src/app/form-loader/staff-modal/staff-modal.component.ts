import { NgxNotificationService } from 'ngx-notification';
import { BehaviorSubject, catchError, EMPTY, map, Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { BreadcrumbService } from 'src/app/services/breadcrumb.service';
import { YesNoModalComponent } from 'src/app/shared/components/yes-no-modal/yes-no-modal.component';
import { StaffModel } from 'src/app/shared/interfaces/template';

import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'mds-staff-modal',
  templateUrl: './staff-modal.component.html',
  styleUrls: ['./staff-modal.component.scss']
})
export class StaffModalComponent implements OnInit {

  constructor(public activeModal: NgbActiveModal, private api: ApiService, private modalService: NgbModal,
    private notifSvc: NgxNotificationService) { }

  searchQuery: string = "";
  newStaff: StaffModel = {
    id: "",
    name: "",
    licNo: ""
  }

  selectedStaff: StaffModel = {} as StaffModel;

  isAdmin: boolean = false;

  staffList$: BehaviorSubject<StaffModel[]> = new BehaviorSubject([] as StaffModel[]);

  ngOnInit(): void {
    this.api.getStaff().subscribe((staff: StaffModel[]) => {
      this.staffList$.next(staff);
    });
  }

  get staffList(): Observable<StaffModel[]> {
    return this.staffList$.pipe(map((staffArray: StaffModel[]) => {
      return this.searchQuery.trim().length ? staffArray.filter(item =>
        item.name.toLocaleLowerCase().includes(this.searchQuery.trim().toLowerCase())
        || item.licNo === this.searchQuery.trim().toLowerCase()) : staffArray;
    }));
  }

  saveStaff() {
    this.api.saveStaff(this.newStaff).subscribe((addedStaff: StaffModel) => {
      this.staffList$.next([...this.staffList$.getValue(), addedStaff]);
      if (this.newStaff.id?.length === 0) {
        this.notifSvc.sendMessage(`Successfully added ${addedStaff.name} to staff list`, 'success', 'top-left');
      } else {
        this.notifSvc.sendMessage(`Successfully updated ${addedStaff.name} record from staff list`, 'success', 'top-left');
      }
      this.resetForm();
    });
  }

  editStaff(staff: StaffModel) {
    this.newStaff = staff;
    this.staffList$.next(this.staffList$.getValue().filter(staffEl => staffEl.id !== staff.id));
  }


  selectStaff(staff: StaffModel) {
    this.activeModal.close(staff);
  }

  deleteStaff(staff: StaffModel) {
    const modalRef = this.modalService.open(YesNoModalComponent, {
      size: 'md',
      backdrop: 'static'
    });

    modalRef.componentInstance.title = `Delete "${staff.name}"?`
    modalRef.componentInstance.modalBody = `Delete ${staff.name} with license no. ${staff.licNo} from the list of staff?`

    modalRef.closed.subscribe((response) => {
      if (response) {
        this.api.deleteStaff(staff).pipe(catchError((err) => {
          if (err) {
            this.notifSvc.sendMessage(`Could not delete record for ${staff.name} from the database. Remove the data from the other records first.`, 'danger', 'top-left')
          }

          return EMPTY;
        })).subscribe(() => {
          this.staffList$.next(this.staffList$.getValue().filter(staffItem => staffItem.id !== staff.id));
          this.notifSvc.sendMessage(`Successfully deleted ${staff.name} from the staff list`, 'success', 'top-left');
        });
      }
    })
  }

  resetForm() {
    this.newStaff = {
      id: "",
      name: "",
      licNo: ""
    }
  }

  dismiss() {
    const staffToReturn = this.selectedStaff ? this.staffList$.getValue().find(staff => this.selectedStaff.id === staff.id) : null;

    if (staffToReturn) {
      this.activeModal.close(staffToReturn);

      return;
    }

    this.activeModal.dismiss();
  }
}
