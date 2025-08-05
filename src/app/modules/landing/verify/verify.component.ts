import { Component, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-verify',
  imports: [MatButtonModule, RouterLink, MatIconModule],
  templateUrl: './verify.component.html',
  encapsulation: ViewEncapsulation.None
})
export class VerifyComponent {

}
