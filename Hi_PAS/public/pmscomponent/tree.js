angular.module('PMapp', ['ea.treeview', 'ui.router', 'ngTouch', 'ui.grid', 'ui.grid.autoResize']).config(function ($stateProvider, $locationProvider) {
        $stateProvider
            .state('default', {
                templateUrl: '/Angular-Tree-View/demo/api.html',
                url: '/'
            })
            .state('api', {
                abstract: true,
                template: '<div ui-view></div>',            
                url: '/Angular-Tree-View/api'
            })
            .state('api.treeView', {
                templateUrl: '/Angular-Tree-View/demo/treeViewApi.html',
                url: '/treeview'
            })
            .state('api.treeViewItem', {
                templateUrl: '/Angular-Tree-View/demo/treeViewItemApi.html',
                url: '/treeviewitem'
            })
            .state('readme', {
                templateUrl: '/Angular-Tree-View/demo/readMe.html',
                url: '/Angular-Tree-View/readme'
            })
            .state('example', {
                abstract: true,
                template: '<div ui-view></div>',
                url: '/Angular-Tree-View/examples'
            })
            .state('example.basic', {
                controller: 'basicController',
                templateUrl: '/Angular-Tree-View/demo/basicExample.html',
                url: '/basic'
            })
            .state('example.advanced', {
                controller: 'advancedController',
                templateUrl: '/Angular-Tree-View/demo/advancedExample.html',
                url: '/advanced'
            });
    
            $locationProvider.html5Mode(true);
})/*
var mymod=angular.module('demo',['ea.treeview'])*/
    .controller('mainController', function ($scope, $state, eaTreeViewFactory) {
        $scope.model = {
            menu: [
                {
                    display: 'API', items: [
                        { display: 'Tree View', isActive: false, stateName: 'api.treeView' },
                        { display: 'Tree View Item', isActive: false, stateName: 'api.treeViewItem' }
                    ]
                },
                { display: 'Read Me', isActive: false, stateName: 'readme' },
                {
                    display: 'Examples',
                    expanded: false,
                    items: [
                        { display: 'Basic', isActive: false, stateName: 'example.basic' },
                        { display: 'Advanced', isActive: false, stateName: 'example.advanced' }
                    ]
                }
            ]
        };

        eaTreeViewFactory.setItems($scope.model.menu);
        eaTreeViewFactory.bindEvent();

        $scope.go = function (item) {
            $state.go(item.stateName, item);
        };
    }).controller('basicController', function ($scope, eaTreeViewFactory) {
        $scope.model = {
            simpsons: [
                {
                    display: '스테커크래인',
                    items: [
                        { display: 'S/C1', items: [{ display: 'Bart', stateName: 'Homer-Bart' }, { display: 'Lisa', stateName: 'Homer-Lisa' }, { display: 'Maggie', stateName: 'Homer-Maggie' }] },
                        { display: 'S/C2', stateName: 'Herb' },
                        { display: 'S/C3', stateName: 'Abbie' }
                    ]
                },
                {
                    display: '자율주행차량',
                    items: [
                        { display: 'LGV1', stateName: 'Patty' },
                        { display: 'LGV2', stateName: 'Selma' },
                        { display: 'LGV3', items: [{ display: 'Bart', stateName: 'Marge-Bart' }, { display: 'Lisa', stateName: 'Marge-Lisa' }, { display: 'Maggie', stateName: 'Marge-Maggie' }] },
                    ]
                }
            ]
        };


        eaTreeViewFactory.setItems($scope.model.simpsons, $scope.$id);

        $scope.show = function (item) {
            $scope.model.imageSource = '/Angular-Tree-View/demo/images/' + item.stateName + '.jpg';
            $scope.model.imageAlt = item.display;
        };
    }).controller('advancedController', function ($scope, eaTreeViewFactory) {
        $scope.model = {
            simpsons: [
                {
                    display: 'Abe',
                    items: [
                        { display: 'Homer', items: [{ display: 'Bart', stateName: 'Homer-Bart' }, { display: 'Lisa', stateName: 'Homer-Lisa' }, { display: 'Maggie', stateName: 'Homer-Maggie' }] },
                        { display: 'Herb', stateName: 'Herb' },
                        { display: 'Abbie', stateName: 'Abbie' }
                    ]
                },
                {
                    display: 'Jacqueline',
                    items: [
                        { display: 'Patty', stateName: 'Patty' },
                        { display: 'Selma', stateName: 'Selma' },
                        { display: 'Marge', items: [{ display: 'Bart', stateName: 'Marge-Bart' }, { display: 'Lisa', stateName: 'Marge-Lisa' }, { display: 'Maggie', stateName: 'Marge-Maggie' }] },
                    ]
                }
            ],
            characters: [
                { display: 'Howard Cunningham', kids: [{ display: 'Richie Cunningham', stateName: 'Richie' }, { display: 'Joanie Cunningham', stateName: 'Joanie' }] },
                { display: 'Potsie', stateName: 'Potsie', catchPhrase: 'What\'s a catch phrase?' },
                { display: 'Fonzie', stateName: 'Fonzie', catchPhrase: 'Heeeeeeeeey!' }
            ]
        };

        $scope.simpsonsKey = $scope.$id + 'simpsons';
        $scope.happyDaysKey = $scope.$id + 'characters';

        eaTreeViewFactory.setItems($scope.model.simpsons, $scope.simpsonsKey);
        eaTreeViewFactory.setItems($scope.model.characters, $scope.happyDaysKey);

        $scope.showPicture = function (item) {
            $scope.model.catchPhrase = null;
            $scope.model.imageSource = '/Angular-Tree-View/demo/images/' + item.stateName + '.jpg';
            $scope.model.imageAlt = item.display;
        };

        $scope.showCatchPhrase = function (item) {
            $scope.model.imageSource = null;
            $scope.model.imageAlt = null;
            $scope.model.catchPhrase = item.catchPhrase;
        };
    }).controller('GridMainCtrl', ['$scope', '$http', '$log', function ($scope, $http, $log) {
        $scope.gridOptions = {};

        $scope.gridOptions.columnDefs = [
            { name: 'id', width: 50 },
            { name: 'name', width: 100, pinnedLeft: true },
            { name: 'age', width: 100, pinnedRight: true },
            { name: 'address.street', width: 150 }

        ];

        //$http.get('/data/500_complex.json')
        //  .success(function(data) {
        $scope.gridOptions.data = [
            {
                "id": "Cox",
                "name": "barney",
                "age": "Enormo",
                "address.street": true
            },
            {
                "id": "Cox",
                "name": "zarney",
                "age": "Enormo",
                "address.street": true
            },
            {
                "id": "Cox",
                "name": "Tarney",
                "age": "Enormo",
                "address.street": true
            }
        ];
        $scope.randomSize = function () {
            var newHeight = Math.floor(Math.random() * (300 - 100 + 1) + 300);
            var newWidth = Math.floor(Math.random() * (600 - 200 + 1) + 200);

            angular.element(document.getElementsByClassName('grid')[0]).css('height', newHeight + 'px');
            angular.element(document.getElementsByClassName('grid')[0]).css('width', newWidth + 'px');
        };
    }]).run(function ($rootScope, eaTreeViewFactory) {
        $rootScope.$on('$stateChangeSuccess', function (event, args) {
            eaTreeViewFactory.resetItemTemplateUrl();
        });
    });