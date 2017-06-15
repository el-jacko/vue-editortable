<template>
  <div id="wrapper" ref="wrapper">
    <div id="container">  
      <div id="lodingScreen" v-if="loading">
        <icon name="refresh" spin class="refresh"></icon>
      </div>
      <div id="showColumnsModal" @click.self="setShowColumnsModal()" v-show="showColumnsModal">
        <ul>
          <span @click="setShowColumnsModal()">
            <icon name="times" class="modalTimes"></icon>
          </span>
          <li v-for="(col, index) in cols">
            <input type="checkbox" :name="col.name" :id="col.name" v-model="col.show" @change="updateShowColumns(index)">
            <label :for="col.name">{{ col.name }}</label>
          </li>
        </ul>
      </div>
      <div id="top-menu">
        <div class="vet-btn-group">
          <a role="button" class="vet-btn" @click="addRow()">
            <icon name="plus" class="plus"></icon>
            New
          </a>
          <a role="button" class="vet-btn" @click="deleteRow()">
            <icon name="trash" class="trash"></icon>
            Delete
          </a>
          <a role="button" class="vet-btn" @click="setShowColumnsModal()">
            <icon name="eye" class="eye"></icon>
            Show
          </a>
          <input 
          type="text" 
          name="query" 
          v-model="filterKey" 
          placeholder="Search" 
          ref="search" 
          id="search" 
          v-if="opt.showSearchFilter">
        </div>
        <div class="vet-btn-group swipe-btns">
          <a role="button" :class="[leftSwipable ? 'vet-btn' : 'vet-btn disabled']" @click="leftSwipable && swipeLeft()">
            <icon name="arrow-left" class="arrow-left"></icon>
          </a>
          <a role="button" :class="[rightSwipable ? 'vet-btn' : 'vet-btn disabled']" @click="rightSwipable && swipeRight()">
            <icon name="arrow-right" class="arrow-right"></icon>
          </a>
        </div>
      </div>
      <table class="vue-editortable" ref="table">
        <thead>
          <tr>
            <th v-for="col in cols" 
            @click="sortBy(col.name, $event)" 
            :class="{ active: sortArray.indexOf(col.name) >= 0 }"
            v-show="!col.hidden && col.show"
            ref="tableHead">
            {{ col.title }}
            <span>
              <icon :name="sortOrders[col.name] > 0 ? 'long-arrow-up' : 'long-arrow-down'" class="sorting"></icon>
              {{ sortOrderNumber(col.name) }}
            </span>
          </th>
        </tr>
      </thead>
      <tbody v-if="!loading">
       <tr v-for="(row, rowIndex) in filteredData" 
       @click="setSelection(filteredData[rowIndex].id.value, $event)" 
       :class="[selectedRowArray.indexOf(filteredData[rowIndex].id.value) >= 0 ? 'activeRow' : '']">
       <td v-for="(cell, key, index) in row" 
       @click="setTarget(rowIndex, key)"
       :class="[cell.isActive ? 'activeCell' : '']"
       v-show="!cell.isHidden && cell.show"
       :data-th="key">
       <div class="cell-wrapper">
        <div v-show="!cell.isActive || !cell.isEditable" ref="span">{{ cell.value }}</div>
        <input 
        type="text" 
        name="cell"
        spellcheck="false" 
        v-show="cell.isActive && cell.isEditable" 
        v-model="thisCell.value"
        @change="saveData(rowIndex, key, filteredData[rowIndex][key].value, filteredData[rowIndex].id.value, $event)"
        @keydown.shift.left="selectCell(rowIndex, index, $event)"
        @keydown.shift.right="selectCell(rowIndex, index, $event)"
        @keydown.up="selectCell(rowIndex, index, $event)"
        @keydown.down="selectCell(rowIndex, index, $event)"
        :class="[cell.isActive ? 'activeCell' : '']"
        ref="inputFields">
        <div v-show="savingIndex == rowIndex && savingKey == key" class="spinner-wrapper">
          <icon name="spinner" spin class="spinner"></icon>
        </div>
      </div>
      <div v-if="cell.hasErrors.length > 0" class="validation-error">{{ cell.hasErrors[0] }}</div>
    </td>
  </tr>
</tbody>
</table>
<div id="pagination" v-if="opt.pagination.show">
  <div class="row">
    <label for="temsPerPage">Show: </label>
    <select class="itemsPerPageDropdown" v-model="opt.pagination.itemsPerPage" id="itemsPerPage" @change="resetCurrentPage()">
      <option v-for="option in opt.pagination.itemsPerPageValues" v-bind:value="option.value">
        {{ option.text }}
      </option>
    </select>
  </div>
  <div class="row numbers">
    <a :class="[isStartPage ? 'vet-btn disabled' : 'vet-btn']" role="button" @click="showPrev" :disabled="isStartPage">&laquo;</a>
    <div v-for="pageNumber in totalPages">
      <a class="vet-btn disabled points" role="button" v-show="pageNumber == 2 && currentPage >= 3&& maxNumber >= 7" disabled>...</a>
      <a :class="[currentPage == pageNumber - 1 ? 'vet-btn active' : 'vet-btn']"
      @click="setPage(pageNumber)"
      v-if="isInPaginationRange(pageNumber)"
      role="button">
      {{ pageNumber }}
    </a>
    <a class="vet-btn disabled points" role="button" v-show="pageNumber == maxNumber - 2 && currentPage <= maxNumber - 4 && maxNumber >= 7" disabled>...</a>
  </div>
  <a :class="[isEndPage ? 'vet-btn disabled' : 'vet-btn']" role="button" @click="showNext" :disabled="isEndPage">&raquo;</a>
</div>
</div>
</div>
</div>
</template>

<script>
  import 'vue-awesome/icons/long-arrow-up';
  import 'vue-awesome/icons/long-arrow-down';
  import 'vue-awesome/icons/refresh';
  import 'vue-awesome/icons/spinner';
  import 'vue-awesome/icons/times';
  import 'vue-awesome/icons/eye';
  import 'vue-awesome/icons/plus';
  import 'vue-awesome/icons/trash';
  import 'vue-awesome/icons/arrow-left';
  import 'vue-awesome/icons/arrow-right';
  import Icon from 'vue-awesome/components/Icon';
  import Requests from '../mixins/Requests';
  import Pagination from '../mixins/Pagination';
  import Validator from '../mixins/Validator';

  export default {
    props: {
      data: {
        type: Object,
        required: true,
      },
      options: {
        type: Object,
        required: false,
        default: () => {},
      },
      searchQuery: {
        type: String,
        required: false,
        default: '',
      },
    },
    components: {
      Icon,
    },
    mixins: [Requests, Pagination, Validator],
    data() {
      const sortOrders = {};
      this.data.columns.forEach((key) => {
        sortOrders[key.name] = 1;
      });
      return {
        opt: {},
        defaultOptions: {
          pagination: {
            show: true,
            itemsPerPage: 25,
            itemsPerPageValues: [
            { text: 25, value: 25 },
            { text: 50, value: 50 },
            { text: 100, value: 100 },
            ],
          },
          requests: {
            getUrl: false,
            postUrl: false,
            putUrl: false,
            patchUrl: false,
            deleteUrl: false,
          },
          showSearchFilter: false,
        },
        cols: [],
        loading: false,
        savingIndex: 0,
        savingKey: '',
        sortKey: '',
        filterKey: '',
        sortOrders,
        sortArray: [],
        tableData: [],
        inputField: {},
        selectedRowArray: [],
        activeCell: false,
        wrapperWidth: 0,
        initTableWidth: 0,
        tableWidth: 0,
        columnsWidth: [],
        showColumnsModal: false,
        startCol: 0,
        activeCol: 0,
        map: {},
        leftSwipable: false,
        rightSwipable: true,
        thisCell: {},
        gotTransformed: false,
      };
    },
    created() {
      const vm = this;
      vm.setOptions();
      vm.setColumns();
      vm.setData();
      window.addEventListener('keydown', this.shortcuts);
      window.addEventListener('keyup', this.shortcuts);
    },
    methods: {
      shortcuts(e) {
        const vm = this;
        vm.map[e.keyCode] = e.type === 'keydown';
        // alt + arrow left -> swipeleft
        if (vm.map[18] && vm.map[37]) {
          vm.swipeLeft();
          vm.map[37] = false;
        }
        // alt + arrow right -> swiperight
        if (vm.map[18] && vm.map[39]) {
          vm.swipeRight();
          vm.map[39] = false;
        }
        // alt + f -> focus search
        if (vm.map[18] && vm.map[70]) {
          e.preventDefault();
          vm.$refs.search.focus();
        }
        // alt + n -> add new row
        if (vm.map[18] && vm.map[78]) {
          e.preventDefault();
          vm.addRow();
        }
        // alt + backspace || alt + delete -> delete row
        if ((vm.map[18] && vm.map[8]) || (vm.map[18] && vm.map[46])) {
          e.preventDefault();
          vm.deleteRow();
        }
      },
      getWrapperWidth() {
        const vm = this;
        vm.wrapperWidth = vm.$el.clientWidth;
      },
      getTableWidth() {
        const vm = this;
        const ths = vm.$refs.tableHead;
        let res = 0;
        for (let i = 0; i < ths.length; i += 1) {
          res += ths[i].offsetWidth;
        }
        vm.tableWidth = res;
        if (vm.initTableWidth === 0) {
          vm.initTableWidth = vm.tableWidth;
        }
        vm.getWrapperWidth();
        vm.setTableWidth();
      },
      getColumnsWidth() {
        const vm = this;
        vm.columnsWidth = [];
        const l = vm.$refs.inputFields.length;
        let ii = 0;
        for (let i = 0; i < l; i += 1) {
          vm.$refs.span[i].style.width = null;
          vm.$refs.inputFields[i].style.width = null;
          if (ii < vm.columnsWidth.length - 1) {
            ii += 1;
          } else {
            ii = 0;
          }
        }
        vm.$nextTick(() => {
          const ths = this.$refs.tableHead;
          for (let i = 0; i < ths.length; i += 1) {
            vm.columnsWidth.push(ths[i].offsetWidth);
          }
          vm.setColumnsWidth();
        });
      },
      setColumnsWidth() {
        const vm = this;
        const l = vm.$refs.inputFields.length;
        let ii = 0;
        for (let i = 0; i < l; i += 1) {
          vm.$refs.span[i].style.width = `${vm.columnsWidth[ii]}px`;
          vm.$refs.inputFields[i].style.width = `${vm.columnsWidth[ii]}px`;
          if (ii < vm.columnsWidth.length - 1) {
            ii += 1;
          } else {
            ii = 0;
          }
        }
        vm.$nextTick(() => {
          vm.doInitTableWidths = false;
          vm.getTableWidth();
        });
      },
      initTableWidths() {
        const vm = this;
        const ratio = window.devicePixelRatio || 1;
        const w = screen.width * ratio;
        if ((w / ratio) > 713) {
          const l = vm.cols.length;
          for (let i = 0; i < l; i += 1) {
            if (vm.cols[i].hidden) {
              vm.$set(vm.cols[i], 'hidden', false);
              const ll = vm.tableData.length;
              for (let ii = 0; ii < ll; ii += 1) {
                vm.$set(vm.tableData[ii][vm.cols[i].name], 'isHidden', false);
              }
            }
          }
          vm.$nextTick(() => {
            vm.initTableWidth = 0;
            vm.getColumnsWidth();
          });
        }
      },
      setTableWidth() {
        const vm = this;
        const ths = vm.$refs.tableHead;
        if (vm.tableWidth > vm.wrapperWidth) {
          const l = vm.cols.length;
          for (let i = 0; i < l; i += 1) {
            if (vm.cols[i].hidden) {
              vm.$set(vm.cols[i], 'hidden', false);
              const ll = vm.tableData.length;
              for (let ii = 0; ii < ll; ii += 1) {
                vm.$set(vm.tableData[ii][vm.cols[i].name], 'isHidden', false);
              }
            }
          }
          vm.$nextTick(() => {
            for (let i = 0; i < l; i += 1) {
              if (!vm.cols[i].show) {
                vm.tableWidth -= ths[i].offsetWidth;
              }
            }
            for (let i = l - 1; i >= 0; i -= 1) {
              if (vm.tableWidth < vm.wrapperWidth) {
                break;
              }
              if (!vm.cols[i].hidden) {
                vm.tableWidth -= ths[i].offsetWidth;
                vm.$set(vm.cols[i], 'hidden', true);
                const ll = vm.tableData.length;
                for (let ii = 0; ii < ll; ii += 1) {
                  vm.$set(vm.tableData[ii][vm.cols[i].name], 'isHidden', true);
                }
              }
            }
            vm.$refs.table.style.width = '100%';
          });
        }
        vm.$nextTick(() => {
          let sum = 0;
          for (let i = 0; i < ths.length; i += 1) {
            if (!vm.cols[i].hidden) {
              sum += ths[i].offsetWidth;
            }
          }
          if (sum === vm.initTableWidth) {
            vm.$refs.wrapper.style.display = 'flex';
            vm.$refs.wrapper.style.flexFlow = 'column nowrap';
            vm.$refs.wrapper.style.alignItems = 'center';
          }
          vm.$nextTick(() => {
            for (let i = 0; i < vm.activeCol; i += 1) {
              if (vm.cols[vm.activeCol].hidden) {
                vm.swipeRight();
              }
            }
          });
        });
      },
      setTableWidthReverse() {
        const vm = this;
        if (vm.tableWidth > vm.wrapperWidth) {
          const l = vm.cols.length;
          for (let i = l - 1; i >= 0; i -= 1) {
            if (vm.cols[i].hidden) {
              vm.$set(vm.cols[i], 'hidden', false);
              const ll = vm.tableData.length;
              for (let ii = 0; ii < ll; ii += 1) {
                vm.$set(vm.tableData[ii][vm.cols[i].name], 'isHidden', false);
              }
            }
          }
          vm.$nextTick(() => {
            for (let i = 0; i < l; i += 1) {
              if (!vm.cols[i].show) {
                vm.tableWidth -= vm.columnsWidth[i];
              }
            }
            for (let i = 0; i < l; i += 1) {
              if (vm.tableWidth < vm.wrapperWidth) {
                break;
              }
              if (!vm.cols[i].hidden) {
                vm.tableWidth -= vm.columnsWidth[i];
                vm.$set(vm.cols[i], 'hidden', true);
                const ll = vm.tableData.length;
                for (let ii = 0; ii < ll; ii += 1) {
                  vm.$set(vm.tableData[ii][vm.cols[i].name], 'isHidden', true);
                }
              }
            }
          });
        }
      },
      swipeLeft() {
        const vm = this;
        const l = vm.cols.length;
        const ll = vm.tableData.length;
        let nextCol = 0;
        let startCol = 0;
        for (let i = l - 1; i >= 0; i -= 1) {
          if (vm.cols[0].hidden && !vm.cols[i].hidden && vm.cols[i].show) {
            startCol = i;
            break;
          }
        }
        for (let i = 0; i < l; i += 1) {
          if (vm.cols[0].hidden && vm.cols[i].hidden && vm.cols[i].show) {
            nextCol = i;
          } else if (vm.cols[l - 1].hidden && !vm.cols[i].hidden && vm.cols[i].show) {
            break;
          }
        }
        function sumCols() {
          let sum = 0;
          for (let i = 0; i < vm.columnsWidth.length; i += 1) {
            if (!vm.cols[i].hidden) {
              sum += vm.columnsWidth[i] + 32;
            }
          }
          return sum;
        }
        if (vm.cols[0].hidden && vm.cols[nextCol].hidden && vm.cols[nextCol].show) {
          vm.$set(vm.cols[nextCol], 'hidden', false);
          for (let ii = 0; ii < ll; ii += 1) {
            vm.$set(vm.tableData[ii][vm.cols[nextCol].name], 'isHidden', false);
          }
          nextCol -= 1;
        }
        for (let i = startCol; i >= 0; i -= 1) {
          if ((sumCols() + vm.columnsWidth[nextCol] <= vm.wrapperWidth) && vm.cols[0].hidden
            && vm.cols[nextCol].hidden && vm.cols[nextCol].show) {
            vm.$set(vm.cols[nextCol], 'hidden', false);
            for (let ii = 0; ii < ll; ii += 1) {
              vm.$set(vm.tableData[ii][vm.cols[nextCol].name], 'isHidden', false);
            }
            nextCol -= 1;
          }
          if (sumCols() >= vm.wrapperWidth && !vm.cols[startCol].hidden && vm.cols[startCol].show) {
            vm.$set(vm.cols[startCol], 'hidden', true);
            for (let ii = 0; ii < ll; ii += 1) {
              vm.$set(vm.tableData[ii][vm.cols[startCol].name], 'isHidden', true);
            }
            startCol -= 1;
          }
        }
        if (!vm.cols[0].hidden) {
          vm.leftSwipable = false;
        }
        if (vm.cols[vm.cols.length - 1].hidden) {
          vm.rightSwipable = true;
        }
      },
      swipeRight() {
        const vm = this;
        const l = vm.cols.length;
        const ll = vm.tableData.length;
        let nextCol = l - 1;
        let startCol = l - 1;
        for (let i = 0; i < l; i += 1) {
          if (vm.cols[l - 1].hidden && !vm.cols[i].hidden && vm.cols[i].show) {
            startCol = i;
            break;
          }
        }
        for (let i = l - 1; i >= 0; i -= 1) {
          if (vm.cols[l - 1].hidden && vm.cols[i].hidden && vm.cols[i].show) {
            nextCol = i;
          } else if (vm.cols[l - 1].hidden && !vm.cols[i].hidden && vm.cols[i].show) {
            break;
          }
        }
        function sumCols() {
          let sum = 0;
          for (let i = 0; i < vm.columnsWidth.length; i += 1) {
            if (!vm.cols[i].hidden) {
              sum += vm.columnsWidth[i] + 32;
            }
          }
          return sum;
        }
        if (vm.cols[l - 1].hidden && vm.cols[nextCol].hidden && vm.cols[nextCol].show) {
          vm.$set(vm.cols[nextCol], 'hidden', false);
          for (let ii = 0; ii < ll; ii += 1) {
            vm.$set(vm.tableData[ii][vm.cols[nextCol].name], 'isHidden', false);
          }
          nextCol += 1;
        }
        for (let i = startCol; i < l; i += 1) {
          if ((sumCols() + vm.columnsWidth[nextCol] <= vm.wrapperWidth) && vm.cols[l - 1].hidden
          && vm.cols[nextCol].hidden && vm.cols[nextCol].show) {
            vm.$set(vm.cols[nextCol], 'hidden', false);
            for (let ii = 0; ii < ll; ii += 1) {
              vm.$set(vm.tableData[ii][vm.cols[nextCol].name], 'isHidden', false);
            }
            nextCol += 1;
          }
          if (sumCols() >= vm.wrapperWidth && !vm.cols[startCol].hidden && vm.cols[startCol].show) {
            vm.$set(vm.cols[startCol], 'hidden', true);
            for (let ii = 0; ii < ll; ii += 1) {
              vm.$set(vm.tableData[ii][vm.cols[startCol].name], 'isHidden', true);
            }
            startCol += 1;
          }
        }
        if (vm.cols[0].hidden) {
          vm.leftSwipable = true;
        }
        if (!vm.cols[vm.cols.length - 1].hidden) {
          vm.rightSwipable = false;
        }
      },
      setOptions() {
        const obj = this.defaultOptions;
        const b = this.data.options;
        Object.keys(b).forEach((key) => {
          if (b[key] !== null && typeof b[key] !== 'undefined' && b[key].length > 1) {
            Object.keys(b[key]).forEach((k) => {
              obj[key][k] = b[key][k];
            });
          } else if (b[key].isArray) {
            Object.keys(b[key]).forEach((k) => {
              obj[key][k] = b[key][k];
            });
          } else {
            obj[key] = b[key];
          }
        });
        this.opt = obj;
      },
      setColumns() {
        const vm = this;
        const cols = vm.data.columns;
        const l = vm.data.columns.length;
        let obj = {};
        for (let i = 0; i < l; i += 1) {
          if (Object.prototype.hasOwnProperty.call(cols[i], 'title')) {
            obj.title = cols[i].title;
          } else {
            obj.title = 'defaultTitle';
          }
          if (Object.prototype.hasOwnProperty.call(cols[i], 'name')) {
            obj.name = cols[i].name;
          } else {
            obj.name = 'defaultName';
          }
          if (Object.prototype.hasOwnProperty.call(cols[i], 'editable')) {
            obj.editable = cols[i].editable;
          } else {
            obj.editable = true;
          }
          if (Object.prototype.hasOwnProperty.call(cols[i], 'hidden')) {
            obj.hidden = cols[i].hidden;
          } else {
            obj.hidden = false;
          }
          if (Object.prototype.hasOwnProperty.call(cols[i], 'show')) {
            obj.show = cols[i].show;
          } else {
            obj.show = true;
          }
          if (Object.prototype.hasOwnProperty.call(cols[i], 'validator')) {
            obj.validator = cols[i].validator;
          } else {
            obj.validator = false;
          }
          vm.cols.push(obj);
          obj = {};
        }
      },
      // set data Object with all needed and given options
      setData() {
        const vm = this;
        vm.loading = true;
        let rawData = {};
        function cb(response) {
          rawData = response.data;
          const l = rawData.length;
          for (let i = 0; i < l; i += 1) {
            let row = {};
            let cell = {};
            const ll = vm.cols.length;
            for (let ii = 0; ii < ll; ii += 1) {
              cell.value = rawData[i][vm.cols[ii].name];
              cell.isActive = false;
              cell.isEditable = vm.cols[ii].editable;
              cell.isHidden = vm.cols[ii].hidden;
              cell.show = vm.cols[ii].show;
              cell.hasErrors = [];
              cell.isNew = false;
              row[vm.cols[ii].name] = cell;
              cell = {};
            }
            vm.tableData.push(row);
            row = {};
          }
          vm.loading = false;
        }
        function errorCb() {
          vm.loading = false;
        }
        // get data from prop values if set or from api if url is set
        if (vm.data.values !== undefined) {
          rawData.data = vm.data.values;
          cb(rawData);
        } else if (vm.opt.requests.getUrl) {
          vm.getData(vm.opt.requests.getUrl, cb, errorCb);
        }
      },
      // save changed cell / post request
      saveData(rowIndex, key, value, id) {
        const vm = this;
        vm.showSavingIcon(key, rowIndex);
        let errors = [];
        vm.cols.forEach((obj) => {
          if (obj.name === key) {
            if (obj.validator) {
              errors = vm.validate(obj.validator.rules, obj.validator.messages, value);
            }
          }
        });
        vm.$set(vm.filteredData[rowIndex][key], 'hasErrors', errors);
        function cb() {
          vm.savingKey = false;
          vm.savingIndex = false;
        }
        function errorCb() {
          vm.savingKey = false;
          vm.savingIndex = false;
        }
        if (errors.length === 0) {
          console.log('inside save', errors.length);
          const postData = {};
          postData[key] = value;
          const data = postData;
          if (vm.filteredData[rowIndex][key].isNew && vm.opt.requests.postUrl) {
            vm.filteredData[rowIndex][key].isNew = false;
            const url = `${vm.opt.requests.postUrl}`;
            vm.postData(url, data, cb, errorCb);
          } else if (vm.opt.requests.patchUrl) {
            const url = `${vm.opt.requests.patchUrl}/${id}`;
            vm.patchData(url, data, cb, errorCb);
          }
          for (let i = 0; i < vm.cols.length; i += 1) {
            if (vm.cols[i].name === key) {
              vm.activeCol = i;
              break;
            }
          }
          vm.initTableWidths();
        } else {
          errorCb();
        }
      },
      // set sorting array and key, data gets filtered (computed)
      sortBy(key, event) {
        const vm = this;
        const index = vm.sortArray.indexOf(key);
        vm.sortKey = key;
        if (event.altKey) {
          if (index !== -1) {
            vm.sortArray.splice(index, 1);
          }
        } else if (!event.altKey) {
          if (index === -1) {
            vm.sortArray.push(key);
          } else {
            vm.sortOrders[key] *= -1;
          }
        }
      },
      sortOrderNumber(key) {
        const vm = this;
        let index;
        if (vm.sortArray.indexOf(key) >= 0) {
          index = vm.sortArray.indexOf(key) + 1;
        } else {
          index = '';
        }
        return index;
      },
      showSavingIcon(key, rowIndex) {
        this.savingIndex = rowIndex;
        this.savingKey = key;
      },
      addRow() {
        const vm = this;
        let val;
        const highestId = Math.max(...vm.tableData.map((obj) => {
          val = obj.id.value;
          return val;
        }));
        let row = {};
        let cell = {};
        const l = vm.cols.length;
        let setActive = false;
        let activeKey = 0;
        for (let i = 0; i < l; i += 1) {
          cell.value = '';
          cell.isActive = false;
          cell.isEditable = vm.cols[i].editable;
          cell.hasErrors = [];
          if (vm.cols[i].hidden) {
            cell.isHidden = true;
          } else {
            cell.isHidden = false;
          }
          if (vm.cols[i].show) {
            cell.show = true;
          } else {
            cell.show = false;
          }
          if (cell.isEditable && !cell.hidden && cell.show && !setActive) {
            activeKey = vm.cols[i].name;
            setActive = true;
          }
          row[vm.cols[i].name] = cell;
          cell = {};
        }
        const thisRowIndex = vm.activeCell.rowIndex;
        vm.tableData.splice(thisRowIndex, 0, row);
        vm.tableData[thisRowIndex].id.value = highestId + 1;
        vm.tableData[thisRowIndex][vm.activeCell.col].isNew = true;
        row = {};
        vm.$nextTick(() => {
          vm.setTarget(thisRowIndex, activeKey);
          vm.setSelection(vm.tableData[thisRowIndex].id.value, false);
        });
      },
      deleteRow() {
        const vm = this;
        let nextId;
        for (let i = 0; i < vm.filteredData.length; i += 1) {
          if (vm.selectedRowArray[vm.selectedRowArray.length - 1] === vm.filteredData[i].id.value) {
            nextId = vm.filteredData[i + 1].id.value;
          }
        }
        function cb() {
          for (let i = 0; i < vm.selectedRowArray.length; i += 1) {
            for (let ii = 0; ii < vm.tableData.length; ii += 1) {
              if (vm.tableData[ii].id.value === vm.selectedRowArray[i]) {
                vm.tableData.splice(ii, 1);
                break;
              }
            }
          }
          vm.$nextTick(() => {
            vm.setTarget(vm.getRowIndex(nextId), 'firstname');
            vm.setSelection(nextId, false);
          });
        }
        function errorCb() {
        }
        if (vm.selectedRowArray.length > 0) {
          let str = '';
          const l = vm.selectedRowArray.length;
          for (let i = 0; i < l; i += 1) {
            str += vm.selectedRowArray[i];
            if (i + 1 < l) str += ',';
          }
          if (vm.opt.requests.deleteUrl) {
            const url = `${vm.opt.requests.deleteUrl}/${str}`;
            vm.deleteData(url, cb, errorCb);
          }
        }
      },
      // helper
      getRowIndex(id) {
        const vm = this;
        let key;
        for (let i = 0; i < vm.filteredData.length; i += 1) {
          if (id === vm.filteredData[i].id.value) {
            key = i;
          }
        }
        let finalRowIndex = key;
        for (let rowIndex = key; rowIndex > vm.itemsPerPage; rowIndex -= vm.itemsPerPage) {
          finalRowIndex = rowIndex;
        }
        return finalRowIndex;
      },
      // set active cell
      setTarget(rowIndex, key) {
        const vm = this;
        console.log('============', this.gotTransformed);
        if (Object.keys(this.thisCell).length !== 0
          && !this.gotTransformed
          && (vm.activeCell.rowIndex !== rowIndex || vm.activeCell.col !== key)) {
          vm.filteredData[vm.activeCell.rowIndex][vm.activeCell.col].value = this.thisCell.value;
        }
        if (vm.filteredData[rowIndex][key].isEditable) {
          if (vm.activeCell.rowIndex !== rowIndex
            || vm.activeCell.col !== key || this.gotTransformed) {
            vm.thisCell.value = vm.filteredData[rowIndex][key].value;
          }
          this.gotTransformed = false;
          if (vm.activeCell) vm.$set(vm.activeCell, 'isActive', false);
          vm.activeCell = vm.filteredData[rowIndex][key];
          vm.activeCell.rowIndex = rowIndex;
          vm.activeCell.col = key;
          vm.activeCell.page = this.currentPage;
          vm.$set(vm.filteredData[rowIndex][key], 'isActive', true);
          vm.$nextTick(() => {
            document.querySelector('input[name=cell].activeCell').focus();
          });
        } else {
          vm.$set(vm.activeCell, 'isActive', false);
        }
      },
      setSelection(id, event) {
        const vm = this;
        const index = vm.selectedRowArray.indexOf(id);
        if (event.altKey) {
          if (index !== -1) {
            vm.selectedRowArray.splice(index, 1);
          } else if (index === -1) {
            vm.selectedRowArray.push(id);
          }
        } else if (!event.altKey) {
          vm.selectedRowArray = [];
          vm.selectedRowArray.push(id);
        }
      },
      selectCell(rowIndex, index) {
        const vm = this;
        const lastCol = vm.cols.length - 1;
        const lastIndex = vm.filteredData.length - 1;
        const cols = vm.cols;
        function moveRight(thisIndex, thisRowIndex) {
          let i = thisIndex;
          let ri = thisRowIndex;
          if (i + 1 <= lastCol) {
            if (vm.filteredData[ri][cols[i + 1].name].isEditable
              && vm.filteredData[ri][cols[i + 1].name].show
              && !vm.filteredData[ri][cols[i + 1].name].isHidden) {
              vm.setTarget(ri, cols[i + 1].name);
            } else if (vm.filteredData[ri][cols[i + 1].name].isEditable
            && vm.filteredData[ri][cols[i + 1].name].show
            && vm.filteredData[ri][cols[i + 1].name].isHidden) {
              vm.swipeRight();
              vm.setTarget(ri, cols[i + 1].name);
            } else {
              i += 1;
              moveRight(i, ri);
            }
          } else if (ri + 1 <= lastIndex) {
            if (vm.filteredData[ri + 1][cols[0].name].isEditable
            && vm.filteredData[ri + 1][cols[0].name].show
            && !vm.filteredData[ri + 1][cols[0].name].isHidden) {
              vm.tableWidth = vm.initTableWidth;
              vm.setTableWidth();
              vm.setSelection(vm.filteredData[ri + 1][cols[0].name].value, event.key);
              vm.setTarget(ri + 1, cols[0].name);
            } else {
              vm.tableWidth = vm.initTableWidth;
              vm.setTableWidth();
              i = 0;
              ri += 1;
              vm.setSelection(vm.filteredData[ri][cols[0].name].value, event.key);
              moveRight(i, ri);
            }
          } else if (vm.currentPage <= vm.totalPages - 1) {
            vm.tableWidth = vm.initTableWidth;
            vm.setTableWidth();
            vm.setPage(vm.currentPage + 2);
            if (vm.filteredData[0][cols[0].name].isEditable
          && vm.filteredData[0][cols[0].name].show
          && !vm.filteredData[0][cols[0].name].isHidden) {
              vm.setSelection(vm.filteredData[0][cols[0].name].value, event.key);
              vm.setTarget(0, cols[0].name);
            } else {
              i = 0;
              ri = 0;
              vm.setSelection(vm.filteredData[ri][cols[i].name].value, event.key);
              moveRight(i, ri);
            }
          }
        }
        function moveLeft(thisIndex, thisRowIndex) {
          let i = thisIndex;
          let ri = thisRowIndex;
          if (i - 1 >= 0) {
            if (vm.filteredData[ri][cols[i - 1].name].isEditable
        && vm.filteredData[ri][cols[i - 1].name].show
        && !vm.filteredData[ri][cols[i - 1].name].isHidden) {
              vm.setTarget(ri, cols[i - 1].name);
            } else if (vm.filteredData[ri][cols[i - 1].name].isEditable
      && vm.filteredData[ri][cols[i - 1].name].show
      && vm.filteredData[ri][cols[i - 1].name].isHidden) {
              vm.swipeLeft();
              vm.setTarget(ri, cols[i - 1].name);
            } else {
              i -= 1;
              moveLeft(i, ri);
            }
          } else if (ri > 0) {
            vm.tableWidth = vm.initTableWidth;
            vm.setTableWidthReverse();
            if (vm.filteredData[ri - 1][cols[lastCol].name].isEditable
      && vm.filteredData[ri - 1][cols[lastCol].name].show
      && !vm.filteredData[ri - 1][cols[lastCol].name].isHidden) {
              vm.setSelection(vm.filteredData[ri - 1][cols[0].name].value, event.key);
              vm.setTarget(ri - 1, cols[lastCol].name);
            } else {
              vm.tableWidth = vm.initTableWidth;
              vm.setTableWidthReverse();
              i = lastCol;
              ri -= 1;
              vm.setSelection(vm.filteredData[ri][cols[0].name].value, event.key);
              moveLeft(i, ri);
            }
          } else if (vm.currentPage > 0) {
            vm.tableWidth = vm.initTableWidth;
            vm.setTableWidthReverse();
            vm.setPage(vm.currentPage);
            if (vm.filteredData[lastIndex][cols[lastCol].name].isEditable
    && vm.filteredData[lastIndex][cols[lastCol].name].show
    && !vm.filteredData[lastIndex][cols[lastCol].name].isHidden) {
              vm.setSelection(vm.filteredData[lastIndex][cols[0].name].value, event.key);
              vm.setTarget(lastIndex, cols[lastCol].name);
            } else {
              vm.tableWidth = vm.initTableWidth;
              vm.setTableWidthReverse();
              i = lastCol;
              ri = lastIndex;
              vm.setSelection(vm.filteredData[ri][cols[i].name].value, event.key);
              moveLeft(i, ri);
            }
          }
        }
        function moveUp(thisIndex, thisRowIndex) {
          const i = thisIndex;
          let ri = thisRowIndex;
          if (ri - 1 >= 0) {
            if (vm.filteredData[ri - 1][cols[i].name].isEditable) {
              vm.setSelection(vm.filteredData[ri - 1][cols[0].name].value, event.key);
              vm.setTarget(ri - 1, cols[i].name);
            } else {
              ri -= 1;
              moveUp(i, ri);
            }
          } else if (vm.currentPage > 0) {
            vm.setPage(vm.currentPage);
            if (vm.filteredData[lastIndex][cols[i].name].isEditable) {
              vm.setSelection(vm.filteredData[lastIndex][cols[0].name].value, event.key);
              vm.setTarget(lastIndex, cols[i].name);
            } else {
              ri = lastIndex;
              moveUp(i, ri);
            }
          }
        }
        function moveDown(thisIndex, thisRowIndex) {
          const i = thisIndex;
          let ri = thisRowIndex;
          if (ri + 1 <= lastIndex) {
            if (vm.filteredData[ri + 1][cols[i].name].isEditable) {
              vm.setSelection(vm.filteredData[ri + 1][cols[0].name].value, event.key);
              vm.setTarget(ri + 1, cols[i].name);
            } else {
              ri += 1;
              moveDown(i, ri);
            }
          } else if (vm.currentPage < vm.totalPages - 1) {
            vm.setPage(vm.currentPage + 2);
            if (vm.filteredData[0][cols[i].name].isEditable) {
              vm.setSelection(vm.filteredData[0][cols[0].name].value, event.key);
              vm.setTarget(0, cols[i].name);
            } else {
              ri += 1;
              moveDown(i, ri);
            }
          }
        }
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          moveRight(index, rowIndex);
        } else if (event.key === 'ArrowLeft') {
          event.preventDefault();
          moveLeft(index, rowIndex);
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          moveUp(index, rowIndex);
        } else if (event.key === 'ArrowDown') {
          event.preventDefault();
          moveDown(index, rowIndex);
        }
      },
      setShowColumnsModal() {
        this.showColumnsModal = !this.showColumnsModal;
      },
      updateShowColumns(index) {
        const vm = this;
        const l = vm.tableData.length;
        if (!vm.cols[index].show) {
          for (let i = 0; i < l; i += 1) {
            vm.$set(vm.tableData[i][vm.cols[index].name], 'show', false);
          }
        } else if (vm.cols[index].show) {
          for (let i = 0; i < l; i += 1) {
            vm.$set(vm.tableData[i][vm.cols[index].name], 'show', true);
          }
        }
        vm.initTableWidths();
      },
    },
    computed: {
      // filter data
      filteredData() {
        const vm = this;
        const sortArray = vm.sortArray;
        const sortKey = vm.sortKey;
        const filterKey = vm.filterKey && vm.filterKey.toLowerCase();
        let data = vm.tableData;
        // filter from search form
        if (filterKey) {
          vm.gotTransformed = true;
          data = data.filter((row) => {
            const obj = Object.keys(row).some((key) => {
              const str = String(row[key].value).toLowerCase().indexOf(filterKey) > -1;
              return str;
            });
            return obj;
          });
          vm.resetCurrentPage();
        }
        // sort by columns/rows
        function sortRows(arr) {
          return (a, b) => arr.map((key) => {
            const name = key;
            if (a[name].value > b[name].value) {
              return vm.sortOrders[key];
            } else if (a[name].value < b[name].value) {
              return -(vm.sortOrders[key]);
            }
            return 0;
          }).reduce((cb, val) => (cb || val), 0);
        }
        if (sortKey) {
          vm.gotTransformed = true;
          data = data.slice().sort(sortRows(sortArray));
        }
        vm.$nextTick(() => {
          const ratio = window.devicePixelRatio || 1;
          const w = screen.width * ratio;
          if ((w / ratio) > 713) {
            if (vm.tableWidth === 0) {
              vm.getColumnsWidth();
            }
          }
        });
        return vm.paginate(data);
      },
    },
  };
</script>

<style>
  @import "http://fonts.googleapis.com/css?family=Open+Sans:300,400,700";
  #wrapper {
    /*width: 100%;*/
    font-family: 'Open Sans';
    margin: 20px;
  }
  #showColumnsModal {
    position: fixed;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    top: 0;
    left: 0;
    z-index: 1000;
  }
  #showColumnsModal ul {
    position: relative;
    border-radius: 10px;
    padding: 50px 100px;
    background-color: #fff;
    list-style: none;
  }
  .fa-icon.modalTimes {
    z-index: 10000;
    position: absolute;
    top: 10px;
    right: 10px; 
    height: 1.4em; 
  }
  .vet-btn {
    margin: 0 5px;
    padding: 5px 10px;
    background-color: #fff;
    color: #112B38;
    border: 1px solid #112B38;
    border-radius: 5px;
    cursor: pointer;
  }
  .vet-btn:hover {
    background-color: #B2C61D;
  }
  .vet-btn.active {
    background-color: #B2C61D;
  }
  .vet-btn.disabled.points {
    color: #000;
  }
  .vet-btn.disabled {
    cursor: default;
    color: lightgrey;
    border: 1px solid lightgrey;
  }
  .vet-btn.disabled:hover {
    background-color: #fff;
  }
  .icon-vet-btn {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-flow: row nowrap;
  }
  .vet-btn-group {
    display: flex;
  }
  .row {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
  }
  .fa-icon {
    width: auto;
    top: 2px;
    position: relative;
  }
  .fa-icon.sorting {
    height: 0.8em;
    padding: 0 2px; 
    top: 0;
  }
  .fa-icon.refresh {
    fill: #B2C61D;
    height: 4em;
  }
  .fa-icon.spinner {
    fill: #B2C61D;
    height: 0.9em;
  }
  .spinner-wrapper {
    position: absolute;
    right: 5px;
    top: 0;
  }
  table.vue-editortable {
    /*width: 100%;*/
    font-size: 18px;
    color: #fff;
    /*margin: 50px;*/
    border-radius: .4em;
    border-collapse: separate;
    border-spacing: 0;
  }
  .vue-editortable th {
    /*width: 1px;*/
    text-align: left;
  }
  .vue-editortable th, .vue-editortable td:before {
    color: #B2C61D;
  }
  .vue-editortable th, .vue-editortable td {
    /*display: table-cell;*/
    padding: 14px !important;
    /*margin: .5em 1em;*/
    /*border: none;*/
    /*white-space: nowrap;*/
  }
  .vue-editortable thead tr {
    background-color: #112B38;
  }
  .vue-editortable tbody tr:nth-child(odd) td {
    border: 2px solid #194764;
  }
  .vue-editortable tbody tr:nth-child(odd),
  .vue-editortable tbody tr:nth-child(odd) input[type="text"] {
    background-color: #194764;
  }
  .vue-editortable tbody tr:nth-child(even) td {
    border: 2px solid #163D55;
  }
  .vue-editortable tbody tr:nth-child(even),
  .vue-editortable tbody tr:nth-child(even) input[type="text"] {
    background-color: #163D55;
  }
  .vue-editortable th:first-child, .vue-editortable td:first-child {
    padding-left: 0;
  }
  .vue-editortable th:last-child, .vue-editortable td:last-child {
    padding-right: 0;
  }
  .vue-editortable td:first-child {
    padding-top: .5em;
  }
  .vue-editortable td:last-child {
    padding-bottom: .5em;
  }
  .vue-editortable input[type="text"] {
    margin: 0;
    padding: 0;
    width: 100%;
    font-size: 18px;
    font-family: 'Open Sans';
    appearance: none;
    box-shadow: none;
    border-radius: none;
    border: none;
    color: #fff;
    box-sizing:border-box;
  }
  .vue-editortable input[type="text"]:focus {
    outline: none; 
  }
  .vue-editortable th.active {
    color: #fff;
  }
  .vue-editortable tbody tr.activeRow td {
    border: 2px solid #2E7CA4;
    background-color: #2E7CA4;
  }
  .vue-editortable tbody tr td.activeCell {
    border: 2px solid #B2C61D;
  }
  .vue-editortable tbody tr input[type="text"].activeCell {
    background-color: #2E7CA4;
  }
  .cell-wrapper {
    position: relative;
  }
  #top-menu {
    display: flex;
    flex-flow: row wrap;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  #top-menu #search {
    margin-left: 5px;
    height: 30px;
    font-size: 18px;
    border: 1px solid black;
    border-radius: 5px;
  }
  #top-menu #search:focus {
    outline: none !important;
    border: 1px solid #B2C61D;
    /*box-shadow: 0 0 10px;*/
  }
  #top-menu .btn-group {
    flex-flow: row wrap;
  }
  #lodingScreen {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.8);
    display: flex;
    flex-flow: column nowrap;
    justify-content: center
  }
  #pagination {
    margin-top: 20px;
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
  }
  #pagination a.btn.disabled:hover {
    background-color: #fff;
  }
  .validation-error {
    color: red;
    font-size: 0.8em;
  }

  @media only screen and (max-width: 713px) {
    table.vue-editortable {
      width: 100%;
    }
    .vue-editortable td:before {
      content: attr(data-th) ": ";
      font-weight: bold;
      width: 6.5em;
      display: inline-block;
      text-transform: capitalize;
    }
    .vue-editortable th {
      display: none;
    }
    .vue-editortable td {
      padding: .25em .5em;
      text-align: left;
      display: block;
    }
    .cell-wrapper {
      display: inline-block;
    }
    #top-menu .btn {
      margin: 0 20px 20px 0;
    }
    #top-menu input[type="text"] {
      margin: 0 20px 20px 0;
    }
    .swipe-btns {
      display: none;
    }
    #pagination {
      flex-flow: column nowrap;
    }
    #pagination .row {
      margin: 0 0 20px 0;
    }
    #pagination .numbers .btn {
      font-size: 10px;
      margin: 0 2px;
      padding: 3px 6px;
    }
  }
  @media only screen and (max-width: 400px) {
    body {
      margin: 0;
    }
    #wrapper {
      margin: 0;
    }
    #top-menu, #pagination {
      margin: 10px;
    }
  }
</style>
