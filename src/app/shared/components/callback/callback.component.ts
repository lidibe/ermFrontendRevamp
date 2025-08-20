import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    template: '',
    standalone: true
})
export class CallbackComponent implements OnInit {
    constructor(private router: Router) {}

    ngOnInit(): void {
        this.handleRedirect();
    }

    handleRedirect(): void {
        const redirectURL =
            localStorage.getItem('lastRoute') || '/bosedr/directors';

        this.router.navigate([redirectURL]);
    }
}
