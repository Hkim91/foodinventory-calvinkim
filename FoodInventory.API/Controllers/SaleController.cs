using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

using FoodInventory.Data;
using FoodInventory.Data.Models;

namespace FoodInventory.API.Controllers
{
    [RoutePrefix("api/Sale")]
    public class SaleController : ApiController
    {
        private UnitOfWork _unitOfWork = new UnitOfWork();

        [HttpGet]
        public HttpResponseMessage Get([FromUri]int id = 0)
        {
            try
            {
                if (id == 0)
                {
                    //Get all sales
                    var dbListingOfSalesToReturn = _unitOfWork.SaleRepository.Get();
                    var tempListToReturn = from p in dbListingOfSalesToReturn
                                           select new FoodInventory.Data.Models.DTOs.SaleDTO()
                                           {
                                               ID = p.ID,
                                               SaleDate = p.SaleDate,
                                               ProductName = p.ProductName,
                                               QuantityBought = p.QuantityBought,
                                               Discount = p.Discount,
                                               PaymentType = p.PaymentType
                                           };
                    return Request.CreateResponse(HttpStatusCode.OK, tempListToReturn.ToList());
                }
                else
                {
                    //Get specified sale
                    var dbSaleToReturn = _unitOfWork.SaleRepository.Get().Where(p => p.ID == id).FirstOrDefault();
                    var finalProductToReturn = new FoodInventory.Data.Models.DTOs.SaleDTO
                    {
                        ID = dbSaleToReturn.ID,
                        SaleDate = dbSaleToReturn.SaleDate,
                        ProductName = dbSaleToReturn.ProductName,
                        QuantityBought = dbSaleToReturn.QuantityBought,
                        Discount = dbSaleToReturn.Discount,
                        PaymentType = dbSaleToReturn.PaymentType
                    };

                    return Request.CreateResponse(HttpStatusCode.OK, finalProductToReturn);
                }
            }
            catch (Exception exc)
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest, exc.ToString());
            }
        }
        
        [HttpPost]
        public HttpResponseMessage Post([FromBody] FoodInventory.Data.Models.DTOs.SaleDTO data)
        {
            try
            {
                var messageToReturn = "";

                //Check if item exists
                var product = _unitOfWork.ProductRepository.Get().Where(p => p.Name.Trim().ToUpper() == data.ProductName.Trim().ToUpper()).FirstOrDefault();

                if (product == null)
                {
                    messageToReturn = "There does not exist a product with the name given.";
                    return Request.CreateResponse(HttpStatusCode.NotFound, messageToReturn);
                }
                else
                {
                    //Compare the quantity of product deducted. Invalidate if quantity exists current stock.
                    if (product.UnitsAvailable <= 0 || product.UnitsAvailable < data.QuantityBought)
                    {
                        messageToReturn = "Quantity of product of sales exceeds the current stock. There are " +
                            product.UnitsAvailable + "units of " + product.Name + " available.";
                        return Request.CreateResponse(HttpStatusCode.Conflict, messageToReturn);
                    }
                    else
                    {
                        var productToEdit = _unitOfWork.ProductRepository.Get().Where(p => p.ID == product.ID).FirstOrDefault();

                        var saleToAdd = new Sale
                        {
                            SaleDate = data.SaleDate,
                            ProductName = data.ProductName,
                            QuantityBought = data.QuantityBought,
                            Discount = data.Discount ?? 0,
                            PaymentType = data.PaymentType
                        };
                        _unitOfWork.SaleRepository.Insert(saleToAdd);
                        //Edit quantity of product
                        product.UnitsAvailable -= data.QuantityBought;
                        _unitOfWork.Save();

                        messageToReturn = "Added sale with ID (" + saleToAdd.ID + ").";
                        return Request.CreateResponse(HttpStatusCode.OK, messageToReturn);
                    }
                }
            }
            catch (Exception exc)
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest, exc.ToString());
            }
        }
    }
}