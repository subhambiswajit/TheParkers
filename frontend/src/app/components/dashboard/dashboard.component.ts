import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController } from '@ionic/angular';
import { FirebaseService } from 'src/app/services';
import { environment } from 'src/environments/environment.dev';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  dashboard_user: any;
  public zoom: number;
  public latitude: number;
  public longitude: number;
  public rating: number = 1;

  constructor(private actionSheetCtrl: ActionSheetController, 
              private firebaseService: FirebaseService,
              private router: Router
              ) 
              {
                this.firebaseService.getAuthUser().subscribe({
                  next: response  => {
                      this.dashboard_user = response.user
                  },
                  error: error => {
                    this.firebaseService.clearAuthStates()
                    console.log("Error in get signed user, dashboard", error)
                    this.router.navigate(['/home'])
                  }
                })

                this.zoom = 10;
                this.latitude = 52.520008;
                this.longitude = 13.404954;
              }

   /* istanbul ignore next */
  public async presentActionSheet() {
    console.log('inside action sheet',  this.firebaseService.authUser)
    const actionSheet = await this.actionSheetCtrl.create(environment.actionSheetConfig(this.firebaseService,this.router));
    console.log(actionSheet)
    await actionSheet.present();

    const { role, data } = await actionSheet.onDidDismiss();
    console.log('onDidDismiss resolved with role and data', role, data);
  }

  public navigateToAddParking(){
    this.router.navigateByUrl('/addParking');
  }

  private setCurrentPosition() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.zoom = 12;
      });
    }
  }

  onAutocompleteSelected(result: PlaceResult) {
    console.log('onAutocompleteSelected: ', result);
    let country :string = "";
    let postal_code : string = "";
    let city : string = "";
    let enteredResult = result.address_components;
    if (enteredResult){
      this.rating = Math.floor((result.rating) || (Math.random() * (5 - 1) + 1));
      for (const address of enteredResult){
        //console.log(address);
        if (address['types'].indexOf("country") != -1){
          country = address.long_name;
        }
        if (address['types'].indexOf("postal_code") != -1){
          postal_code = address.long_name;
        }
        if (address['types'].indexOf("locality") != -1){
          city = address.long_name;
        }
  
      }
    }

    this.addressDetails = {
      type : "Feature",
      geometry: {
        type : "Point",
        coordinates: [this.longitude, this.latitude] 
      },
      
      properties: {
        address: result.formatted_address || "",
        city: city,
        country: country,
        area_code: postal_code
      }
    }

  }

  onLocationSelected(location: Location) {
    console.log('onLocationSelected: ', location);
    this.latitude = location.latitude;
    this.longitude = location.longitude;
  }

}
