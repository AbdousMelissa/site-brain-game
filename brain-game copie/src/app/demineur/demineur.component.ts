import { Component, OnInit } from '@angular/core';
import {SudokuComponent} from "../sudoku/sudoku.component";

@Component({
  selector: 'app-demineur',
  templateUrl: './demineur.component.html',
  styleUrls: ['./demineur.component.css']
})
export class DemineurComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    this.getDemineur();
    this.manageButtonsEvent();
  }



  /**
   *
   *
   * Call method associate to select button : create grid ; validate grid ; display solution
   *
   */
  manageButtonsEvent() {
    let bValidate = document.getElementById('bValide');
    let bSolution = document.getElementById('bSolution');
    let bNewGrid = document.getElementById('bNewGrid');

    bValidate.onclick = () => {
      confirm('Valider la grille ?');
      this.validateGrid();
    };

    bSolution.onclick = () => {
      confirm('Afficher la solution ?');
      this.getSolution();
    };

    bNewGrid.onclick = () => {
      confirm('Charger une nouvelle grille ?');
      this.getDemineur();
    };
  }



  /**
   *
   * Make request to spring boot application
   *
   *
   * @param config
   */
  ajax(config) {
    let xhttp: XMLHttpRequest = new XMLHttpRequest();
    xhttp.onload = () => {
      if (xhttp.status == 200) {
        config.success(xhttp.responseText);
      }
    };

    xhttp.open(config.method, config.url, true);
    xhttp.setRequestHeader('Content-Type', 'application/json');

    xhttp.send(config.data);
  }



  /**
   *
   * Define format of request object to call function ajax()
   *
   *
   * @param method
   * @param url
   * @param data
   * @param success
   * @returns {{method: any; url: any; data: any; success: any}}
   */
  static formatRequestObject(method, url, data, success) {
    return {
      method,
      url,
      data,
      success
    };
  }







          /******************************   Method to manage buttons   *******************************/




  /**
   *
   * Get back a String which contains elements of a sudoku grid which depend of selected level
   * Then call generateGird and param = String from back
   *
   *    1°)get back value of select to add on url of request
   *    2°)create object of request format to call ajax()
   *    3°)call ajax() and apply method with response of request to create a grid on frontend
   */
  getDemineur() {
    let select = document.querySelector('#levelDemineur');
    let level = select.options[select.selectedIndex].getAttribute('name');
    let method = 'GET';
    let url = 'http://localhost:8080/demineur/' + level;

    switch(level){
      case "niveauFacile" :
      case "niveauMoyen" :
      case "niveauDifficile" :
    }



    let data = null;
    let success = (response) => {
      this.generateGrid(response);
    };

    let config = SudokuComponent.formatRequestObject(method, url, data, success);
    this.ajax(config);
  }







  generateGrid(response) {


    // If there is nothing receive from de back -> STOP
    if (response === '') return;



    // Get back values of grid to generate and select element in those which will contains the sudoku game grid
    let array = DemineurComponent.responseToArray(response);
    let container = document.getElementById('demineurContainer');
    let fragContainer = document.createDocumentFragment();



    // Create principal cube -> the grid and associated style
    let styleCube = 'display: inline-block; position: relative;';
    let cubeContainer = SudokuComponent.createCube('cube', styleCube);
    this.cubeEvent(cubeContainer);



    // Define row and cell style
    let styleRow = 'display: block; position: relative;';

    let styleCell = '' +
      '  display: inline-block;' +
      '  width: 40px;' +
      '  height: 40px;' +
      '  background-color: white;' +
      '  line-height: 40px;' +
      '  box-sizing: border-box;' +
      '  -moz-box-sizing: border-box;' +
      '  -webkit-box-sizing: border-box;';



    // If container already contains a grid -> it's remove
    //    -> Use in function getSolution(); else there is 2 grid diplay on screen
    SudokuComponent.removeGrid(container);



    //Create 81 cell with an Id and a style ; if (Id % 9 === 0) -> it's a new line -> create a new row_Id
    let row;
    let rowNumber;



    for (let i = 0; i < 81; i += 1) {          ////  Loop to implement row_Id  ////

      if (i%9 === 0) {
        rowNumber = (i / 9);
        let rowId = 'row_' + rowNumber;
        row = SudokuComponent.createRow(rowId, styleRow);
        cubeContainer.appendChild(row);
      }

      let crt = array[i];
      let cellId = 'grid_' + i;
      let value = crt > 0 ? crt : '-';
      let cell = SudokuComponent.createCell(cellId, styleCell, value);
      cell.setAttribute('column',  '' + (i%9));
      cell.setAttribute('row',  '' + rowNumber);
      cell.classList.add('cellGrid');
      SudokuComponent.generateBorder(cell, i);

      if (crt === 0) this.setSelectableCell(cell, cubeContainer);

      row.appendChild(cell);

    }                                         ////  END loop  ////




    fragContainer.appendChild(cubeContainer);
    container.appendChild(fragContainer);

    SudokuComponent.addCrossBorder(cubeContainer);

  }











  cellEvent(cell, cubeContainer) {
    cell.onclick = (e) => {
      if (e.target === cell) this.devoileCase(cell, cubeContainer);
    }
  }











  /**
   * Check if grid is complete
   *
   * @returns {boolean}
   */
  static checkGridValues() {
    let listCells = document.querySelectorAll('div.cellGrid');
    for (let i = 0; i < listCells.length; i += 1) {
      let crtValue = listCells[i].textContent;
      if (crtValue === '-' ||  crtValue === '') return false;
    }

    return true;
  }








  devoileCase(cell, cubeContainer) {
    SudokuComponent.removeInput();

    let value = parseInt(cell.textContent);
    let left = cell.getAttribute('column') * 40;
    let top = cell.getAttribute('row') * 40;

    if(value == 0) {
    let input = document.createElement('input');

    input.id = 'inputDemineur';
    input.classList.add('selectable');
    input.setAttribute('refCell', cell.id);
    input.setAttribute('style', '' +
      'width: 34px;' +
      'height: 33px;' +
      'line-height: 33px;' +
      'position: absolute;' +
      'left: ' + left + 'px;' +
      'top: ' + top + 'px;');
    input.type = 'number';
    input.min = '1';
    input.max = '9';
    input.value =  value.toString();

    cubeContainer.appendChild(input);
    input.focus();
    this.inputEvent(input);
  }












}
