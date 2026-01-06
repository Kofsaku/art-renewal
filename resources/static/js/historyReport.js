class HistoryReport {
    constructor() {
        this.currentFilters = {
            periodType: 'all',
            startDate: null,
            endDate: null,
            dataDisplay: 'all'
        };
        this.historyData = [];
        this.filteredData = [];
        this.currentPage = 1;
        this.itemsPerPage = 30;
        
        // 13個の列定義
        this.columnDefinitions = {
            'occurredDate': { title: '発生日時', draggable: true },
            'personalCode': { title: '個人コード', draggable: true },
            'issueCount': { title: '発行回数', draggable: true },
            'managementNumber': { title: '管理番号', draggable: true },
            'name': { title: '氏名', draggable: true },
            'departmentCode': { title: '所属コード', draggable: true },
            'departmentName': { title: '所属', draggable: true },
            'categoryCode': { title: '区分コード', draggable: true },
            'categoryName': { title: '区分名称', draggable: true },
            'alternativeCode': { title: '代替コード', draggable: true },
            'gateNumber': { title: 'ゲート番号', draggable: true },
            'gateName': { title: 'ゲート名称', draggable: true },
            'historyDetails': { title: '履歴詳細', draggable: true }
        };

        this.columnOrder = ['occurredDate', 'personalCode', 'issueCount', 'managementNumber', 'name', 'departmentCode', 'departmentName', 'categoryCode', 'categoryName', 'alternativeCode', 'gateNumber', 'gateName', 'historyDetails'];
        
        // デフォルトの非表示列
        this.hiddenColumns = ['issueCount', 'managementNumber', 'departmentCode', 'categoryCode', 'categoryName', 'alternativeCode'];
        
        this.excelFilters = {};
        this.draggedColumn = null;
        this.init();
    }

    init() {
        console.log('HistoryReport initializing...');
        this.updateTableHeaders();
        this.renderInitialState();
        
        // Wait for DOM to be ready for event listeners
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupEventListeners();
                // Initialize column manager
                setTimeout(() => {
                    this.populateColumnManager();
                }, 100);
            });
        } else {
            this.setupEventListeners();
            // Initialize column manager
            setTimeout(() => {
                this.populateColumnManager();
            }, 100);
        }
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        // データ表示フィルター
        const dataDisplayFilter = document.getElementById('dataDisplayFilter');
        if (dataDisplayFilter) {
            dataDisplayFilter.addEventListener('change', (e) => {
                this.currentFilters.dataDisplay = e.target.value;
                this.applyFiltersAndDisplay();
            });
        }

        // Click outside to close Excel filters
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.excel-filter-trigger') && !e.target.closest('.excel-filter-menu')) {
                this.hideAllExcelFilters();
            }
        });
    }

    renderInitialState() {
        const container = document.getElementById('dataTableContainer');
        const pagination = document.getElementById('paginationContainer');
        const noData = document.getElementById('noDataMessage');
        
        if (container) container.style.display = 'none';
        if (pagination) pagination.style.display = 'none';
        if (noData) noData.style.display = 'block';
    }

    loadHistoryData() {
        console.log('Loading history data...');
        this.historyData = [];
        const statuses = [
            { id: 'normal', color: '#ffffff', textColor: '#000000', label: '正常', details: ['入室', '退室'] },
            { id: 'warning', color: '#ffff00', textColor: '#000000', label: '軽エラー', details: ['バッテリー低下', 'カード読取警告'] },
            { id: 'error', color: '#ff0000', textColor: '#ffffff', label: '重エラー', details: ['通信異常', '不正入室'] },
            { id: 'recovery', color: '#0000ff', textColor: '#ffffff', label: '重エラー復旧', details: ['システム復旧', '通信復旧'] }
        ];

        const deps = [
            { code: '001', name: '総務部' },
            { code: '002', name: '営業部' },
            { code: '003', name: 'システム部' },
            { code: '004', name: '開発部' }
        ];

        const cats = [
            { code: '01', name: '正社員' },
            { code: '02', name: '協力会社' }
        ];

        const names = ['ユーザーA', 'ユーザーB', 'ユーザーC', 'ユーザーD', 'ユーザーE'];

        // 100件のデータを生成
        for (let i = 0; i < 100; i++) {
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const dep = deps[Math.floor(Math.random() * deps.length)];
            const cat = cats[Math.floor(Math.random() * cats.length)];
            const name = names[Math.floor(Math.random() * names.length)];
            
            const date = new Date();
            date.setMinutes(date.getMinutes() - i * 15);

            this.historyData.push({
                occurredDate: this.formatDateTime(date),
                personalCode: String(1000 + i).padStart(6, '0'),
                issueCount: String(Math.floor(Math.random() * 2) + 1),
                managementNumber: `M${String(i).padStart(5, '0')}`,
                name: name,
                departmentCode: dep.code,
                departmentName: dep.name,
                categoryCode: cat.code,
                categoryName: cat.name,
                alternativeCode: `A${String(i).padStart(4, '0')}`,
                gateNumber: String(Math.floor(Math.random() * 10) + 1).padStart(4, '0'),
                gateName: `ゲート${Math.floor(Math.random() * 10) + 1}`,
                historyDetails: status.details[Math.floor(Math.random() * status.details.length)],
                statusId: status.id
            });
        }
    }

    updateTableHeaders() {
        const thead = document.querySelector('#tableHeaders');
        if (!thead) return;
        thead.innerHTML = '';
        
        this.columnOrder.forEach(columnKey => {
            if (this.hiddenColumns.includes(columnKey)) return;
            
            const def = this.columnDefinitions[columnKey];
            const th = document.createElement('th');
            th.setAttribute('data-column', columnKey);
            
            th.innerHTML = `
                ${def.title}
                <div class="excel-filter-trigger" onclick="historyReportInstance.showExcelFilter(event, '${columnKey}')"></div>
                <div class="excel-filter-menu" id="excel-filter-${columnKey}"></div>
            `;
            
            thead.appendChild(th);
        });
    }

    applyPeriodSelection() {
        console.log('Applying period selection...');
        const selectedOption = document.querySelector('input[name="periodOption"]:checked');
        if (!selectedOption) {
            console.warn('No period option selected');
            return;
        }

        this.currentFilters.periodType = selectedOption.value;
        this.loadHistoryData();
        
        // UI表示
        const container = document.getElementById('dataTableContainer');
        const pagination = document.getElementById('paginationContainer');
        const noData = document.getElementById('noDataMessage');
        
        if (container) container.style.display = 'block';
        if (pagination) pagination.style.display = 'flex';
        if (noData) noData.style.display = 'none';
        
        const currentCountTop = document.getElementById('currentCountTop');
        if (currentCountTop) {
            currentCountTop.textContent = `現条件：${this.historyData.length} 件`;
        }

        const modalElement = document.getElementById('periodSelectionModal');
        if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
            modal.hide();
        }

        this.applyFiltersAndDisplay();
    }

    applyFiltersAndDisplay() {
        let data = [...this.historyData];
        
        // データ種別フィルター
        const filterVal = this.currentFilters.dataDisplay;
        if (filterVal !== 'all') {
            data = data.filter(item => item.statusId === filterVal);
        }
        
        // Excelフィルターがあれば適用
        for (const [columnKey, filterValues] of Object.entries(this.excelFilters)) {
            if (!filterValues || filterValues.length === 0) continue;
            data = data.filter(item => filterValues.includes(item[columnKey]));
        }
        
        this.filteredData = data;
        this.currentPage = 1;

        const currentCountTop = document.getElementById('currentCountTop');
        if (currentCountTop) {
            currentCountTop.textContent = `現条件：${this.filteredData.length} 件`;
        }

        this.updatePagination();
        this.displayCurrentPage();
    }

    updatePagination() {
        const totalItems = this.filteredData.length;
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        
        const start = totalItems === 0 ? 0 : (this.currentPage - 1) * this.itemsPerPage + 1;
        const end = Math.min(this.currentPage * this.itemsPerPage, totalItems);
        
        const pageInfo = document.getElementById('pageInfo');
        if (pageInfo) {
            pageInfo.textContent = `${start}-${end} / ${totalItems}件中`;
        }
        
        const pagination = document.getElementById('pagination');
        if (!pagination) return;
        pagination.innerHTML = '';
        
        if (totalPages <= 1) return;

        for (let i = 1; i <= totalPages; i++) {
            const li = document.createElement('li');
            li.className = `page-item ${i === this.currentPage ? 'active' : ''}`;
            li.innerHTML = `<a class="page-link" href="javascript:void(0)" onclick="historyReportInstance.changePage(${i})">${i}</a>`;
            pagination.appendChild(li);
        }
    }

    displayCurrentPage() {
        const tbody = document.getElementById('historyTableBody');
        if (!tbody) return;
        tbody.innerHTML = '';
        
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const pageData = this.filteredData.slice(start, end);
        
        pageData.forEach(row => {
            const tr = document.createElement('tr');
            
            // Apply CSS class based on statusId (recovery maps to row-info)
            const className = row.statusId === 'recovery' ? 'row-info' : `row-${row.statusId}`;
            tr.classList.add(className);
            
            this.columnOrder.forEach(columnKey => {
                if (this.hiddenColumns.includes(columnKey)) return;
                const td = document.createElement('td');
                td.textContent = row[columnKey] || '';
                tr.appendChild(td);
            });
            
            tbody.appendChild(tr);
        });
        
        // Update record count display
        this.updateRecordCount();
    }

    updateRecordCount() {
        const count = this.filteredData.length;
        const recordCountTop = document.getElementById('recordCountTop');
        if (recordCountTop) {
            recordCountTop.textContent = count;
        }
    }

    changePage(page) {
        this.currentPage = page;
        this.displayCurrentPage();
        this.updatePagination();
    }

    // 列管理関連
    showColumnManager() {
        this.populateColumnManager();
        const modalElement = document.getElementById('columnManagerModal');
        if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
            modal.show();
        }
    }

    populateColumnManager() {
        const visibleList = document.getElementById('visibleColumnsList');
        const hiddenList = document.getElementById('hiddenColumnsList');
        const noHiddenMsg = document.getElementById('noHiddenColumns');
        
        if (!visibleList || !hiddenList) return;

        visibleList.innerHTML = '';
        hiddenList.innerHTML = '';

        let hiddenCount = 0;
        
        this.columnOrder.forEach(key => {
            const def = this.columnDefinitions[key];
            const isVisible = !this.hiddenColumns.includes(key);
            
            const itemHTML = `
                <div class="column-item-manager ${!isVisible ? 'hidden' : ''}" data-column="${key}">
                    <span class="column-name">${def.title}</span>
                    <button class="column-toggle-btn" onclick="historyReportInstance.toggleColumnVisibility('${key}')" title="${isVisible ? '非表示にする' : '表示する'}">
                        <i class="fas fa-${isVisible ? 'eye-slash' : 'eye'}"></i>
                    </button>
                </div>
            `;
            
            if (isVisible) {
                visibleList.insertAdjacentHTML('beforeend', itemHTML);
            } else {
                hiddenList.insertAdjacentHTML('beforeend', itemHTML);
                hiddenCount++;
            }
        });

        if (noHiddenMsg) {
            noHiddenMsg.style.display = hiddenCount === 0 ? 'block' : 'none';
        }
        
        // Update hidden columns badge
        const badge = document.getElementById('hiddenColumnsBadge');
        if (badge) {
            if (hiddenCount > 0) {
                badge.textContent = hiddenCount;
                badge.style.display = 'inline';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    toggleColumn(key, show) {
        if (show) {
            this.hiddenColumns = this.hiddenColumns.filter(c => c !== key);
        } else {
            if (this.columnOrder.filter(c => !this.hiddenColumns.includes(c)).length <= 1) {
                alert('少なくとも1つの列を表示する必要があります。');
                return;
            }
            this.hiddenColumns.push(key);
        }
        this.updateTableHeaders();
        this.displayCurrentPage();
        this.populateColumnManager();
    }

    toggleColumnVisibility(columnKey) {
        const isCurrentlyVisible = !this.hiddenColumns.includes(columnKey);
        this.toggleColumn(columnKey, !isCurrentlyVisible);
    }

    resetToDefault() {
        // Reset to default hidden columns
        this.hiddenColumns = ['issueCount', 'managementNumber', 'departmentCode', 'categoryCode', 'categoryName', 'alternativeCode'];
        this.updateTableHeaders();
        this.displayCurrentPage();
        this.populateColumnManager();
    }

    showAllColumns() {
        this.hiddenColumns = [];
        this.updateTableHeaders();
        this.displayCurrentPage();
        this.populateColumnManager();
    }

    resetToDefault() {
        this.hiddenColumns = ['issueCount', 'managementNumber', 'departmentCode', 'categoryCode', 'categoryName', 'alternativeCode'];
        this.updateTableHeaders();
        this.displayCurrentPage();
        this.populateColumnManager();
    }

    // Excelフィルター (簡易版)
    showExcelFilter(event, columnKey) {
        event.stopPropagation();
        this.hideAllExcelFilters();
        const menu = document.getElementById(`excel-filter-${columnKey}`);
        if (!menu) return;

        const uniqueValues = [...new Set(this.historyData.map(item => item[columnKey]))].sort();
        menu.innerHTML = `
            <div class="p-3 border bg-white shadow-lg rounded" style="min-width: 200px; position: absolute; z-index: 1050; border: 1px solid #dee2e6;">
                <div class="border-bottom mb-2 pb-1 d-flex justify-content-between align-items-center">
                    <strong class="text-primary">${this.columnDefinitions[columnKey].title}</strong>
                    <button type="button" class="btn-close" style="font-size: 0.7rem;" onclick="historyReportInstance.hideAllExcelFilters()"></button>
                </div>
                <div style="max-height: 200px; overflow-y: auto;">
                    ${uniqueValues.map(v => `
                        <div class="form-check py-1">
                            <input class="form-check-input" type="checkbox" value="${v}" id="filter-${columnKey}-${v}" 
                                ${(!this.excelFilters[columnKey] || this.excelFilters[columnKey].includes(v)) ? 'checked' : ''}
                                onchange="historyReportInstance.updateExcelFilter('${columnKey}')">
                            <label class="form-check-label" for="filter-${columnKey}-${v}" style="font-size: 0.9rem;">${v || '(空白)'}</label>
                        </div>
                    `).join('')}
                </div>
                <div class="mt-2 text-end border-top pt-2">
                    <button class="btn btn-sm btn-primary w-100" onclick="historyReportInstance.hideAllExcelFilters()">閉じる</button>
                </div>
            </div>
        `;
        menu.classList.add('show');
    }

    updateExcelFilter(columnKey) {
        const menu = document.getElementById(`excel-filter-${columnKey}`);
        const checkboxes = menu.querySelectorAll('input[type="checkbox"]:checked');
        const selectedValues = Array.from(checkboxes).map(cb => cb.value);
        
        const allUniqueValues = [...new Set(this.historyData.map(item => item[columnKey]))];
        if (selectedValues.length === allUniqueValues.length) {
            delete this.excelFilters[columnKey];
        } else {
            this.excelFilters[columnKey] = selectedValues;
        }
        this.applyFiltersAndDisplay();
    }

    hideAllExcelFilters() {
        document.querySelectorAll('.excel-filter-menu').forEach(m => m.classList.remove('show'));
    }

    formatDateTime(date) {
        const y = date.getFullYear();
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        const d = date.getDate().toString().padStart(2, '0');
        const hh = date.getHours().toString().padStart(2, '0');
        const mm = date.getMinutes().toString().padStart(2, '0');
        const ss = date.getSeconds().toString().padStart(2, '0');
        return `${y}/${m}/${d} ${hh}:${mm}:${ss}`;
    }
}

// Global instance
const historyReportInstance = new HistoryReport();
window.historyReportInstance = historyReportInstance;