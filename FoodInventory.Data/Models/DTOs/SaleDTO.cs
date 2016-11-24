using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FoodInventory.Data.Models.DTOs
{
    public class SaleDTO
    {
        public int ID { get; set; }
        public DateTime SaleDate { get; set; }
        public string ProductName { get; set; }
        public int QuantityBought { get; set; }
        public Nullable<decimal> Discount { get; set; }
        public string PaymentType { get; set; }
    }
}
