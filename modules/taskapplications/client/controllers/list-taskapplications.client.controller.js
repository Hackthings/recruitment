/*global $:false */
(function () {
  'use strict';

  angular
    .module('taskapplications')
    .controller('TaskapplicationsListController', TaskapplicationsListController);

  TaskapplicationsListController.$inject = ['$scope' ,'TaskapplicationsService', '$filter', '$compile'];

  function TaskapplicationsListController($scope, TaskapplicationsService, $filter, $compile) {
    var vm = this;

    // Modal
    vm.current = {};
    vm.currentIndex = -1;
    var modal = document.getElementById('myModal');
    //var btn = $('#myBtn');
    var btn = document.getElementById("myBtn");
    var closeBtn = document.getElementsByClassName("close")[0];
    vm.openApplication = function(index) {
      vm.currentIndex = index;
      $scope.current = vm.taskapplications[index];
      modal.style.display = "block";
    };
    closeBtn.onclick = function() {
      modal.style.display = "none";
      vm.currentIndex = -1;
    };
    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    };
    vm.updateApplication = function(){
      // Update DB.
      TaskapplicationsService.update(vm.taskapplications[vm.currentIndex]);
      // Recreate datatable
      vm.table.destroy();
      vm.createDatatable(vm.taskapplications);
      // Hide modal
      modal.style.display = "none";
    };



    TaskapplicationsService.query(function(data) {
      vm.taskapplications = data;
      angular.forEach(vm.taskapplications, function(application, key) {
        application.nr = 1 + key;
        application.date = $filter('date')(application.created, 'yyyy-MM-dd');
        application.choice1 = application.choices[0].choice || '';
        application.choice2 = application.choices[1].choice || '';
        application.choice3 = application.choices[2].choice || '';
        if(application.chosenCompanies && application.chosenCompanies.length > 0){
          application.companies = application.chosenCompanies.reduce(function(previousValue, currentValue, currentIndex) {
            if(currentIndex === 0) {
              return currentValue.name;
            }
            return previousValue + ', ' + currentValue.name;
          }, ''); 
        } else {
          application.companies = '';
        }
      });
      // Datatable code
      // Setup - add a text input to each footer cell
      $('#applicationsList thead tr:first th:not(:first)').each(function (index) {
        var title = $(this).text();
        var pos = index + 1;
        $(this).html('<input class="form-control" id="col-search-'+pos+'" type="text" placeholder="Search '+title+'" />');
      });  

      vm.createDatatable(data);
    });

    vm.createDatatable = function(data){
      vm.table = $('#applicationsList').DataTable({
        dom: 'Bfrtip',
        scrollX: true,
        scrollCollapse: true,
        autoWidth: false,
        paging: false,
        stateSave: true,
        buttons: [
          'copy', 'excel', 'pdf', 'colvis'
        ],
        data: data,
        'order': [[ 1, 'asc' ]],
        columns: [
          { data: 'nr' },
          { data: 'date' },
          { data: 'name',
            'fnCreatedCell': function (nTd, sData, oData, iRow, iCol) {
              $(nTd).html('<button class="btn-link" data-ng-click="vm.openApplication('+ iRow+')">'+sData+'</button>');
              // VIKTIG: för att ng-click ska kompileras och finnas.
              $compile(nTd)($scope);
            }
          },
          { data: 'point' },
          { data: 'assignedTask' },
          { data: 'program' },
          { data: 'year' },
          { data: 'choice1' },
          { data: 'choice2' },
          { data: 'choice3' },
          { data: 'companies' },
          { data: 'driverLicense' },
          { data: 'attendGasque' },
          { data: 'attendKickoff' },
          { data: 'email' },
          { data: 'phone' },
          { data: 'tshirtsize' }
        ]
      });
            
      // Apply the search
      vm.table.columns().every(function (index) {
        var that = this;
        $('input#col-search-'+index).on('keyup change', function () {
          if (that.search() !== this.value) {
            that.search(this.value).draw();
          }
        });
      });
    };

    // For exporting to excel
    $scope.datafields = {
      'name': 'Name',
      'program': 'Program',
      'email': 'Email',
      'phone': 'Phone',
      'foodpref': 'Food preference',
      'motivation': 'Motivation',
      'choice1': 'First Choice',
      'choice2': 'Second Choice',
      'choice3': 'Third Choice'
    };
  }
})();
