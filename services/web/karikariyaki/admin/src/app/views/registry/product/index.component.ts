import { Component, OnInit } from '@angular/core';

// Types
import { Product } from '@interfaces';

// Services
import { ApiService } from '@services';

@Component({
	selector: 'app-registry-product-view',
	templateUrl: './index.component.html',
})
export class RegistryProductViewComponent implements OnInit {
	public dataList: Product[] = [];

	constructor(private _apiService: ApiService) {}

	ngOnInit(): void {
		this._apiService.V1.productRegistry.search().subscribe({
			next: (response) => {
				if (!response.result) {
					return;
				}

				this.dataList = response.result;
			},
		});
	}
}
