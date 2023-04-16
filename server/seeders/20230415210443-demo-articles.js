'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   
    await queryInterface.bulkInsert
    ('articles', [
      { title:'Dün (15.04) hava gec karardi',
        slug:'dün',
        body:'Cünkü yagmur yagmadi. Ben bu yuzden gec geldim. Yagmur yagmayinca kosuyorum',
        created_at: new Date(),
        updated_at: new Date(),
      },
    {   title:'Bugün (16.04) hava gec karardi',
        slug: 'bugün',
        body:'Bugün yagmur yagmadi. Ben bu yuzden gec geldim',
        created_at: new Date(),
        updated_at: new Date(),
      },
    {   title:'Yarin(17.04) hava gec kararacak',
        slug:"yarin",
        body:'Dün yagmur yagmadi. O yuzden yarin gec gelecegim',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ], {});
    
  },

  async down (queryInterface, Sequelize) {
   
     await queryInterface.bulkDelete
     ('articles', null, {});
     
  }
};
