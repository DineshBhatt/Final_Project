import { Version, Environment, EnvironmentType } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-webpart-base';
import * as strings from 'RewardsAndRecognitionWebPartStrings';
import * as pnp from 'sp-pnp-js';
import 'jquery';
require('bootstrap');
import {SPComponentLoader} from '@microsoft/sp-loader'
var TotalLikePerPerson = new Array();
var TotalPerson = new Array();
var TotalCommentPerPerson = new Array();
var CurrentUserId ;
var alreadyPresent:boolean = false;
var alreadyliked = new Array();
export interface IRewardsAndRecognitionWebPartProps {
  description: string;
}

export default class RewardsAndRecognitionWebPart extends BaseClientSideWebPart<IRewardsAndRecognitionWebPartProps> {

  public render(): void {
    SPComponentLoader.loadCss("https://stackpath.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css");
    SPComponentLoader.loadCss('https://use.fontawesome.com/releases/v5.4.1/css/all.css');
    var Context = this.context.pageContext.web.absoluteUrl;
    this.domElement.innerHTML = `
      <div class="panel panel-primary" style="width:300px; margin-left:-16px">
      <div class="panel-heading" style="font-size:15px; background-color:#023576;">Rewards And Recorgnition&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <button class="btn btn-warning btn-circle" id="roundbutton" style="border-radius: 50%;">
      <i class='fa fa-trophy' style='font-size:20px;color:white'></i>
      </button> 
      </div>
      <div class="panel-body">
      <table class="RewardsAndRecorgnition table table-hover" style="margin:-16px; width:300px;">
      
      </table>
      </div>
      </div>
      <div class="modal fade" role="dialog" id="commentModal">
     
      </div>
      `;
      $(document).ready(function(){
        GetUserDetails();
        TotalPerson = [];
        TotalLikePerPerson=[];
        TotalCommentPerPerson = [];
        getTotalPerson();
        
      });
      var CommentUser;
      $(document).on('click','.comment',function (){
        CommentUser = $(this).attr("id");
        getIncreaseTheComment(CommentUser);
      });
      $(document).on('click','.btn-success',function (){
        var CommentValue =$("#Comments").val().toString().trim().replace("  ", " ");
        if(CommentValue==null ||CommentValue=='' || CommentValue.search("%@%")>=0){
          alert("enter the comment");
        }else{
        pnp.sp.web.lists.getByTitle('SpfxRewardsAndRecognitionComments').items.add({UserLookupId:CommentUser, Comments:CommentValue}).then(()=>{
          GetUserDetails();
          TotalPerson = [];
          TotalLikePerPerson=[];
          TotalCommentPerPerson = [];
         getTotalPerson();
        })
      }
      });
      //checks the person already liked 
      $(document).on('click','.Like',function (){
        var UserID:any = $(this).attr("id");
        var ClickID = $(this);
        for(var VerifyPresenseCount=0; VerifyPresenseCount<alreadyliked.length; VerifyPresenseCount++){
          if(alreadyliked[VerifyPresenseCount].UserLikedId==UserID && alreadyliked[VerifyPresenseCount].RewardUserId== CurrentUserId){
            alreadyPresent =true;
          }
        }
        if(!alreadyPresent){
          InsertLike(UserID);
        }else{
          
        }
      });
      //finfing the current userId
      function GetUserDetails() { 
        var url =Context+ "/_api/web/currentuser"; 
          $.ajax({ 
            url: url, 
            headers: { 
                Accept: "application/json;odata=verbose" 
              }, 
            async: false, 
            success: function (data) { 
              CurrentUserId= data.d.Id; 
              }, 
            error: function (data) { 
              alert("An error occurred. Please try again."); 
            } 
          }); 
        }  

      //inserting the like how liked and whom he liked 
      function InsertLike(UserID){
        pnp.sp.web.lists.getByTitle('SpfxRewardsAndRecognitionLikes').items.add({UserLookupId:UserID}).then(()=>{
          GetUserDetails();
          TotalPerson=[];
          TotalLikePerPerson=[];
          TotalCommentPerPerson=[];
          getTotalPerson();
          alreadyPresent = false;
        })
      }

      //shows the last 5 comments and allow to enter new comment
      function getIncreaseTheComment(a){
        var table = null;
          var call = $.ajax({
            url: Context + `/_api/Web/Lists/getByTitle('SpfxRewardsAndRecognitionComments')/items?$expand=UserLookup,Author&$filter=(UserLookup eq `+a+`)&$select=UserLookup/Id,Comments,Created,UserLookup/Title,Author/Title&$top=5&$orderby=Created desc`,
            type: "GET",
            dataType: "json",
            async:false,
            headers: {
                Accept: "application/json; odata=verbose",
                "Content-Type": "application/json;odata=verbose"
            }
          });
          call.done(function (data, textStatus, jqXHR) {
            $("#commentModal div").remove();
            table = $("#commentModal");
           
            table.append(`<div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header" style="background-color: #023576;">
              <button type="button" class="close" data-dismiss="modal">&times;</button>
              <h4 class="modal-title" style="font-size: 30px;font-family: cursive;color: antiquewhite;">Comments</h4>
              </div>
              <div class="modal-body">
              
            </div>
              <div class="EnterYourComment">
                <textarea class="form-control" rows="5" id="Comments" style="width: 450px;margin-left: 70px;" required></textarea>
                
              </div>
              <div class="modal-footer">
              <button type="button" id="`+$("#Comments").val()+`" class="btn btn-success" data-dismiss="modal" value="Submit">Submit</button>
                <button type="button" class="btn btn-primary" data-dismiss="modal">Close</button>
              </div>
            </div>
            
          </div>`);
          var ModelBody = $(".modal-body")
            $.each(data.d.results, function (idx, elem) {
              var objDate = new Date(elem.Created),
                locale = "en-us",
                month = objDate.toLocaleString(locale, { month: "long" });
              ModelBody.append(`
                    
                      <div class="list-group">
                        <a href="#" class="list-group-item disabled" style="background-color:#023576;">${elem.Author.Title}</a>
                        <a href="#" class="list-group-item disabled" style="background-color:#e6f9ff;">${elem.Comments}</a>
                        <a href="#" class="list-group-item disabled" style="background-color:#e6f9ff;">`+ month+" "+objDate.getDate()+", "+objDate.getFullYear()+`</a>
                      </div>
              `);
            });
        });
        call.fail(function (jqXHR, textStatus, errorThrown) {
            var response = JSON.parse(jqXHR.responseText);
            var message = response ? response.error.message.value : textStatus;
            alert("Call hutch failed. Error: " + message);
        });
      }

      //getting each persons information
      function getTotalPerson(){
        var TotalPersonCall = $.ajax({
          url : Context + "/_api/Web/Lists/getByTitle('SpfxRewardsAndRecognition')/items?&$top=3&$orderby=Created desc",
          type: "GET",
          dataType: "json",
          async:false,
          headers: {
              Accept: "application/json; odata=verbose",
              "Content-Type": "application/json;odata=verbose"
          }
        });
        TotalPersonCall.done(function (data, textStatus, jqXHR) {
          $.each(data.d.results, function(index, element){
            TotalPerson.push(element.ID);
            getTotalLike(element.ID);
            getTotalComment(element.ID);
          });
          GetRewardsInformation();
        });
        TotalPersonCall.fail(function (jqXHR, textStatus, errorThrown) {
          var response = JSON.parse(jqXHR.responseText);
          var message = response ? response.error.message.value : textStatus;
          alert("Call hutch failed. Error: " + message);
      });
      }
      //finding total like according to the person
      function getTotalLike(element){
          var TotalPersonLikeCall = $.ajax({
            url : Context + `/_api/Web/Lists/getByTitle('SpfxRewardsAndRecognitionLikes')/items?$filter=(UserLookup eq '`+element+`')`,
            type: "GET",
            dataType: "json",
            async:false,
            headers: {
                Accept: "application/json; odata=verbose",
                "Content-Type": "application/json;odata=verbose"
            }
          });
          TotalPersonLikeCall.done(function (data, textStatus, jqXHR) {
            TotalLikePerPerson.push(data.d.results.length);
            for(var checkCount=0; checkCount<data.d.results.length; checkCount++){
              alreadyliked.push({UserLikedId:data.d.results[0].UserLookupId, RewardUserId:data.d.results[0].AuthorId });
              
            }
          });
          TotalPersonLikeCall.fail(function (jqXHR, textStatus, errorThrown) {
            var response = JSON.parse(jqXHR.responseText);
            var message = response ? response.error.message.value : textStatus;
            alert("Call hutch failed. Error: " + message);
        });
      }
      //getting all comment according to that perticular person
      function getTotalComment(element){
          var TotalPersonLikeCall = $.ajax({
          url : Context + `/_api/Web/Lists/getByTitle('	SpfxRewardsAndRecognitionComments')/items?$filter=(UserLookup eq '`+element+`')`,
          type: "GET",
          dataType: "json",
          async:false,
          headers: {
              Accept: "application/json; odata=verbose",
              "Content-Type": "application/json;odata=verbose"
          }
        });
        TotalPersonLikeCall.done(function (data, textStatus, jqXHR) {
          TotalCommentPerPerson.push(data.d.results.length);
        });
        TotalPersonLikeCall.fail(function (jqXHR, textStatus, errorThrown) {
          var response = JSON.parse(jqXHR.responseText);
          var message = response ? response.error.message.value : textStatus;
          alert("Call hutch failed. Error: " + message);
        });
      }
      //showing all the rewards and recorgnition
      function GetRewardsInformation(){
        var RewardsAndRecorgnitionDiv = $(".RewardsAndRecorgnition");
        var RewardsAndRecorgnitionDivcall = $.ajax({
          url : Context + "/_api/Web/Lists/getByTitle('SpfxRewardsAndRecognition')/items?&$top=3&$orderby=Created desc",
          type: "GET",
          dataType: "json",
          async:false,
          headers: {
              Accept: "application/json; odata=verbose",
              "Content-Type": "application/json;odata=verbose"
          }
        });
        RewardsAndRecorgnitionDivcall.done(function (data, textStatus, jqXHR) {
          var TagIndex = 0;
          $(".RewardsAndRecorgnition tr").remove();
          $.each(data.d.results, function(index, element){
            RewardsAndRecorgnitionDiv.append(`<tr style="border-style: solid;border-width: 1px;"><td style="text-align: center;width:90px;"><div><img src="${element.ImageURL.Url}" alt="${element.Title}" style="width:90px"/><i class="fas fa-caret-right" style="position: absolute; top: `+(29+ TagIndex++*24)+`%; right: 69%; font-size: 18px;"></div></td>
            <td style="text-align: center;background-color: #e6f9ff;"><div style="color: darkblue;font-size: medium;padding-top: 7px;padding-bottom: 7px;">${element.Title},${element.Role}</div>
            <div style="width:186px;font-size: small; white-space: nowrap; width: 154px; overflow: hidden;text-overflow: ellipsis;">${element.Description}</div>
            <div><div class="TotalLike" style="font-size:x-small"><button type="button" id="${element.ID}" class="Like" style="background-color:#e6f9ff;border: none;"><i class="fa fa-thumbs-up" aria-hidden="true"></i>(`+TotalLikePerPerson[index]+`like)</button><button type="button" id="${element.ID}" class="comment" data-toggle="modal" data-target="#commentModal" style="background-color:#e6f9ff;border: none;"><i class="fa fa-comment" aria-hidden="true"></i>(`+TotalCommentPerPerson[index] +`comment)</button></div></div></td></tr>`
            );
          });
        });
        RewardsAndRecorgnitionDivcall.fail(function (jqXHR, textStatus, errorThrown) {
          var response = JSON.parse(jqXHR.responseText);
          var message = response ? response.error.message.value : textStatus;
          alert("Call hutch failed. Error: " + message);
      })
    }
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [{
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [{
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })]
            }]
        }]
    };
  }
}
